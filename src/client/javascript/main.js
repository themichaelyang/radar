// DEPRECIATED FOR NOW
// general main file 
let socket = io(); // don't make this global

function main() {
  if (window.RTCPeerConnection) { // detect if there is webrtc peer connection even
    // todo: assign random room names and have users enter room name, maybe password
    socket.emit('join_room', {roomName: '123'});
    socket.on('joined_room', (data) => { console.log('Room "' + data.roomName + '" joined') });
    // detect user agent
  }
  else {
    document.body.innerHTML = "You don't have WebRTC support!";
  }
}

window.onload = main;
