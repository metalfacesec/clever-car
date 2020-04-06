const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
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
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });

    res.send({});
});

app.get('/games', async function (req, res) {
    try {
        let game_list = await getNesGames();
        res.json({status: 200, data: game_list});
    } catch (err) {
        console.log(err);
        res.json({status: 400, data: []});
    }
});

app.get('/music', async function (req, res) {
    try {
        let music_list = await getMusicDirs();
        res.json({status: 200, data: music_list});
    } catch (err) {
        console.log(err);
        res.json({status: 400, data: []});
    }
});

app.get('/tracks', async function (req, res) {
    try {
        let folder = req.query.folder;

        let track_list = await getTracks(folder);
        res.json({status: 200, data: track_list});
    } catch (err) {
        console.log(err);
        res.json({status: 400, data: []});
    }
});

app.get('/videos', async function (req, res) {
    console.log('!!!');
    try {
        let track_list = await getVideos();
        console.log(track_list);
        res.json({status: 200, data: track_list});
    } catch (err) {
        console.log(err);
        res.json({status: 400, data: []});
    }
});

function getMusicDirs() {
    return new Promise(function (resolve, reject) {
        let directoryPath = path.join(__dirname, '../clever-car-client/public/music');

        fs.readdir(directoryPath, function (err, files) {
            if (err) { return reject(err); } 
        
            resolve(files);
        }); 
    });
}

function getTracks(folder) {
    // TODO: File type filter
    return new Promise(function (resolve, reject) {
        let directoryPath = path.join(__dirname, '../clever-car-client/public/music/' + folder);

        fs.readdir(directoryPath, function (err, files) {
            if (err) { return reject(err); } 
        
            resolve(files);
        }); 
    });
}

function getVideos() {
    return new Promise(function (resolve, reject) {
        let directoryPath = path.join(__dirname, '../clever-car-client/public/video/');
        console.log(directoryPath);

        fs.readdir(directoryPath, function (err, files) {
            if (err) { return reject(err); }

            resolve(files.filter((file) => {
                if (file.endsWith('.avi')) {
                    return true;
                }
                return false;
            }));
        }); 
    });
}


function getNesGames() {
    return new Promise(function (resolve, reject) {
        const directoryPath = path.join(__dirname, 'roms/nes');

        fs.readdir(directoryPath, function (err, files) {
            if (err) { return reject(err); } 
        
            resolve(files);
        }); 
    });
}