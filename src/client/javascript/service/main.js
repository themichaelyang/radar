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
      let canvas = document.createElement('canvas');
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;

      let width = canvas.width;
      let height = canvas.height;

      document.body.append(canvas);

      let ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';

      channel.on('message', (message) => {
        try {
          console.log(JSON.parse(message.data));
          let coords = JSON.parse(message.data);
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.fillRect(0, 0, width, height);

          if (coords) {
            ctx.fillStyle = 'red';
            ctx.lineTo((1 - coords.x) * width, coords.y * height);
            ctx.stroke();
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.beginPath();
            // ctx.arc(coords.x * width, coords.y * height, 5, 0, 2 * Math.PI);
            // ctx.fill();
          }
          else {
            ctx.beginPath();
          }
          //
        }
        catch(e) {
          console.log(message.data);
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
