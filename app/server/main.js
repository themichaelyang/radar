'use strict';

// can have it redirect http --> https in the future?
const fs = require('fs');
const process = require('process');

// self signed keys only used for local testing -- heroku has https default
const OPTIONS = {
  // key: fs.readFileSync(__dirname + '/keys/server.pem'),
  // cert: fs.readFileSync(__dirname + '/keys/server.crt')
};
const CLIENT_DIR = '/';
const PORT = process.env.PORT || 8080;

let server = require('./server.js')(CLIENT_DIR, OPTIONS);

// could potentially just use http
let io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join_room', (data) => {
    let name = data.roomName;
    let room = io.sockets.adapter.rooms[name];
    let totalConnections = room ? room.length : 0;
    if (Object.keys(socket.rooms).length === 1 && totalConnections <= 1) {
      socket.join(name);
      totalConnections++;
      console.log(socket.id + ' joined room "' + name + '"');
      let response = Object.assign({}, data);
      response.totalConnections = totalConnections;
      response.clientId = socket.id;
      socket.emit('joined_room', response);
    }
  });

  // should check if socket is in room
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
