function main() {
  if (window.RTCPeerConnection) { // detect if there is webrtc peer connection even
    let enter = document.getElementById('connect-button');
    let roomNameInput = document.getElementById('room-name-input');
    let form = document.getElementById('form');
    window.channel = new Channel();
    form.onsubmit = (event) => {
      event.preventDefault();
    };
    enter.addEventListener('click', (event) => {
      let roomName = roomNameInput.value;

      channel.on('message', (message) => {
        console.log(message.data);
      });

      channel.connect(roomName).then((dataChannel) => {
        dataChannel.send("what's up from "+channel.clientId);

        beginStreaming(dataChannel);
      });

      enter.disabled = true;
    });
  }
  else {
    document.body.innerHTML = "You don't have WebRTC support!";
  }
}

window.onload = main;
