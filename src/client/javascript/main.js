let socket = io(); // don't make this global

function main() {
  socket.emit('join_room', {roomNumber: 123});
  socket.on('joined_room', (data) => { console.log(data) });
  // detect user agent
}

window.onload = main;
