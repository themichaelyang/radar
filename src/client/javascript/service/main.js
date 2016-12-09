let socket = io(); // don't make this global

function main() {
  if (window.RTCPeerConnection) { // detect if there is webrtc peer connection even
    let enter = document.getElementById('connect-button');
    let roomNameInput = document.getElementById('room-name-input');
    let form = document.getElementById('form');
    window.channel = new Channel();
    form.onsubmit = (event) => {
      event.preventDefault(); // allows enter to be clicked lol
    };

    enter.addEventListener('click', (event) => {
      let roomName = roomNameInput.value;

      channel.on('message', (message) => {
        try {
          console.log(JSON.parse(message.data));
        } catch (e) {

        }
      });

      channel.connect(roomName).then((dataChannel) => {
        dataChannel.send("what's up from "+channel.clientId);
      });

      enter.disabled = true;
    });

  }
  else {
    document.body.innerHTML = "You don't have WebRTC support!";
  }
}

window.onload = main;
