const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const server = require('http').createServer();
const io = require('socket.io')(server);
const GPS = require('gps');

server.listen(3000, function () {
    console.log('Listening');
});

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