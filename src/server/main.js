'use strict';

// can have it redirect http --> https in the future?
const fs = require('fs');
const process = require('process');

const OPTIONS = {
  // key: fs.readFileSync(__dirname + '/keys/server.pem'),
  // cert: fs.readFileSync(__dirname + '/keys/server.crt')
};
const CLIENT_DIR = '/src/client';
const PORT = process.env.PORT || 8080;

let server = require('./server.js')(CLIENT_DIR, OPTIONS);

// could potentially just use http
let io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join_room', (data) => {
    socket.join(data.roomName);
    console.log(socket.id + ' joined room ' + data.roomName);
    socket.emit('joined_room', data);
  });

  socket.on('send_session_description', (data) => {
    socket.broadcast.emit('remote_session_description', data);
  });

  socket.on('send_ICE_candidate', (data) => {
    socket.broadcast.emit('remote_ICE_candidate', data);
  })
});

server.listen(PORT);
console.log('Listening on: ' + PORT);
// http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
require('dns').lookup(require('os').hostname(), (err, add, fam) => {
  console.log('http://' +add + ':' + PORT);
})
