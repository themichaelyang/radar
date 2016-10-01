function connect(calling) {
  console.log("Created RTCPeerConnection");

  let connection = new RTCPeerConnection(config.connection);
  bindICECandidateHandler(connection);

  if (calling) {
    let channel = connection.createDataChannel(config.channel);
    bindDataChannelHandlers(channel);

    makeOffer(connection);
  }
  else {
    awaitDataChannel(connection).then((channel) => {
      console.log("Received RTCDataChannel");
      bindDataChannelHandlers(channel);
    });
  }
}

// could combine makeOffer and makeAnswer
function makeOffer(connection) {
  connection.createOffer(config.offer)
  .then(offer => return connection.setLocalDescription(offer))
  .then(() => sendSessionDescription(connection.localDescription))
  .catch(error => console.error("createOffer() or setLocalDescription() failed: "+error));
}

function makeAnswer(connection) {
  connection.createAnswer(config.offer)
  .then(answer => return connection.setLocalDescription(answer))
  .then(() => sendSessionDescription(connection.localDescription))
  .catch(error => console.error("createAnswer() or setLocalDescription() failed: "+error));
}

function sendSessionDescription(description) {
  // implement
}

// returns promise
// function recieveSessionDescription(connection, description) {
//   connection.setRemoteDescription(description)
//   .then(() => connection.remoteDescription);
// }

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
