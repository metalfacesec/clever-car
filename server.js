const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const server = require('http').createServer();
const io = require('socket.io')(server);
const GPS = require('gps');

server.listen(3000, function () {
    console.log('Listening');
});

const port = new SerialPort('/dev/ttyAMA0', {baudRate: 9600});
port.pipe(new Readline({ delimiter: '\r\n' }))
var gps = new GPS;

io.on('connect', onConnect);

function onConnect(socket) {
    console.log("Connection!");
}

gps.on('data', function(data) {
    console.log('sending data now on socket io');
    io.sockets.emit('coord_update', JSON.stringify({lat: gps.state.lat, lon: gps.state.lon}));
});

port.on('data', function(data) {
    gps.updatePartial(data);
    console.log(gps.state);
});