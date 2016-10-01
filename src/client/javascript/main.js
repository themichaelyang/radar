window.onload = main;

function main() {
  console.log("Created RTCPeerConnection");
  let connection = new RTCPeerConnection(config.connectionConfig);

  bindICECandidateHandler(connection);

  awaitDataChannel(connection)
  .then((channel) => {
    console.log("Received RTCDataChannel");
    channel.onopen = () => {
      console.log("%cRTCDataChannel now open and ready to receive messages", "color:red;");
    }
    channel.onmessage = (event) => {
      let message = event.data;
      console.error("RTCDataChannel recieved a message");
    }
    channel.onclose = () => {
      console.error("RTCDataChannel closed");
    }
    channel.onerror = () => {
      console.error("RTCDataChannel error!");
    }
  });
}

function awaitDataChannel(connection) {
  return new Promise((resolve, reject) => {
    connection.ondatachannel = (event) => {
      let dataChannel = event.channel;
      resolve(dataChannel);
    }
  });
}

function bindICECandidateHandler(connection) {
  connection.onicecandidate = (event) => {
    if (event.candidate) {
      sendICECandidate(event.candidate); // trickle ICE candidates
      console.log("Sent an ICE candidate");
    }
    else {
      console.log("Finished sending ICE candidates");
    }
  }
}

function sendICECandidate(candidate) {
  // implement
}
