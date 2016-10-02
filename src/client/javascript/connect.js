function connect(calling) {
  console.log("Created RTCPeerConnection");

  let connection = new RTCPeerConnection(config.connection);
  bindICECandidateHandlers(connection);

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
  .then(offer => { return connection.setLocalDescription(offer) })
  .then(() => sendSessionDescription(connection.localDescription))
  .catch(error => console.error("createOffer() or setLocalDescription() failed: "+error));
}

function makeAnswer(connection) {
  connection.createAnswer(config.offer)
  .then(answer => { return connection.setLocalDescription(answer) })
  .then(() => sendSessionDescription(connection.localDescription))
  .catch(error => console.error("createAnswer() or setLocalDescription() failed: "+error));
}

function sendSessionDescription(offer) {
  // implement
  console.log(offer);
}

function receiveSessionDescription(connection, receivedDescription) {
  connection.setRemoteDescription(receivedDescription)
  .then(() => {
    console.log("Received and set remoteDescription");
    if (connection.localDescription) { // careful of this -- might wanna have diff function for caller and callee
      // if theres local desc, should be caller
      // idk what it should do tbh
      console.log("Should be connected if ICE is done");
    }
    else {
      // should be callee (answering)
      makeAnswer(connection);
    }
  });
}

function bindICECandidateHandlers(connection) {
  connection.onicecandidate = (event) => {
    if (event.candidate) {
      sendICECandidate(event.candidate); // trickle ICE candidates
      console.log("Sent an ICE candidate");
    }
    else {
      console.log("Finished sending ICE candidates");
    }
  }

  socket.on('remote_ICE_candidate', (data) => {
    console.log(data);
    // add to ice candidates
  });
}

function sendICECandidate(candidate) {
  socket.emit()
}
