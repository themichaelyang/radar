'use strict';

const fs = require('fs');
const process = require('process');

const OPTIONS = {
  key: fs.readFileSync(__dirname + '/keys/server.pem'),
  cert: fs.readFileSync(__dirname + '/keys/server.crt')
};
const CLIENT_DIR = '/src/client';
const PORT = 3000;

let server = require('./server.js')(CLIENT_DIR, OPTIONS);

let io = require('socket.io')(server); // could potentially just use http
let rooms = new Map();

io.on('connection', (socket) => {
  // socket.emit('offer', { hello: 'world' });
  socket.on('create_room', (data) => {
    let roomNumber = Math.floor(Math.random() * Math.pow(10, 10)).toString();
    if (roomNumber !== rooms.keys)
    console.log('New room: '+roomNumber);

    rooms[roomNumber] = offer;
    socket.join(roomNumber);
    socket.broadcast.to(socket.id).emit('joined_room', {'roomNumber': roomNumber});
  });

  socket.on('join_room', (data) => {
    socket.join(data.roomNumber);
    socket.broadcast.to(socket.id).emit('joined_room', data);
  });

  socket.on('send_description', (data) => {
    socket.broadcast.emit('session_description', data);
  });

  socket.on('send_ICE_candidate', (data) => {
    socket.broadcast.emit('ICE_candidate', data);
  })
});

server.listen(PORT);
console.log('Listening on: ' + PORT);
// http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
require('dns').lookup(require('os').hostname(), (err, add, fam) => {
  console.log('http://' +add + ':' + PORT);
})
