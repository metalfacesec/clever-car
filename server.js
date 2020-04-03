const app = require('express')();
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const GPS = require('gps');
const path = require('path');
const fs = require('fs');

var cors = require('cors');

app.use(cors());

server.listen(3069, function () {
    console.log('Listening');
});

app.get('/emulate', function (req, res) {
    const { exec } = require('child_process');

    let child = exec('higan --fullscreen "/home/pi/repo/clever-car-server/roms/nes/' + req.query.game + '"', {}, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
      
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        res.send({});
    });

    // child.on('exit', function (code) {
    //   console.log('Child process exited with exit code '+code);
    //   res.send({});
    // });
});

app.get('/games', async function (req, res) {
    console.log(req);

    try {
        let game_list = await getNesGames();
        res.json({status: 200, data: game_list});
    } catch (err) {
        console.log(err);
        res.json({status: 400, data: []});
    }
});

function getNesGames() {
    return new Promise(function (resolve, reject) {
        const directoryPath = path.join(__dirname, 'roms/nes');

        fs.readdir(directoryPath, function (err, files) {
            if (err) { return reject(err); } 
        
            resolve(files);
        }); 
    });
}

const port = new SerialPort('/dev/ttyAMA0', {baudRate: 9600});
const parser = port.pipe(new Readline({delimiter: '\r\n'}));
var gps = new GPS;

io.on('connect', onConnect);

function onConnect(socket) {
    console.log("Connection!");
}

gps.on('data', data => {
    if (data.type == "GGA" && data.quality != null) {
        console.log('sending data now on socket io');
        io.sockets.emit('coord_update', JSON.stringify({lat: data.lat, lon: data.lon}));
    }
});

parser.on('data', data => {
    gps.update(data);
});