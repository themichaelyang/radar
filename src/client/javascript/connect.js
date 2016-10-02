function connect(calling) {
  console.log('Created RTCPeerConnection');

  let connection = new RTCPeerConnection(config.connection);
  socket.on('remote_session_description', (data) => {
    receiveSessionDescription(connection, data.description);
  });

  if (calling) {
    let channel = connection.createDataChannel("", config.channel);
    console.log(channel);
    bindDataChannelHandlers(channel);

    makeOffer(connection);
  }
  else {
    awaitDataChannel(connection).then((channel) => {
      console.log('Received RTCDataChannel');
      bindDataChannelHandlers(channel);
    });
  }

  bindICECandidateHandlers(connection);
}

// could combine makeOffer and makeAnswer
function makeOffer(connection) {
  connection.createOffer(config.offer)
  .then(offer => {
    // patchSDP(offer); // increase throughput
    // console.log(offer);
    return connection.setLocalDescription(offer)
  })
  .then(() => sendSessionDescription(connection.localDescription))
  .catch(error => console.error('createOffer() or setLocalDescription() failed: '+error));
  console.log('Made and sent Offer')
}

function makeAnswer(connection) {
  connection.createAnswer(config.offer)
  .then(answer => { return connection.setLocalDescription(answer) })
  .then(() => sendSessionDescription(connection.localDescription))
  .catch(error => console.error('createAnswer() or setLocalDescription() failed: '+error));
  console.log('Made and sent Answer');
}

function sendSessionDescription(offer) {
  // implement
  socket.emit('send_session_description', {description: offer});
  console.log('Sent session description');
}

function receiveSessionDescription(connection, receivedDescription) {
  connection.setRemoteDescription(receivedDescription)
  .then(() => {
    console.log('Received and set remoteDescription');
    console.log(connection.localDescription);
    if (!isEmptyDescription(connection.localDescription)) { // technically should be null before set, according to spec
      // if theres local desc, should be caller
      // idk what it should do tbh
      console.log('Should be connected if ICE is done');
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
      console.log('Sent an ICE candidate');
    }
    else {
      console.log('Finished sending ICE candidates');
    }
  }

  socket.on('remote_ICE_candidate', (data) => {
    connection.addIceCandidate(data.candidate).then(() => {
      console.log('Added ICE candidate');
    })
    .catch(error => console.error(error));
  });

  function sendICECandidate(candidate) {
    socket.emit('send_ICE_candidate', {candidate: candidate});
  }
}

function isEmptyDescription(description) {
  return !(description.type && description.sdp);
}

// https://bloggeek.me/send-file-webrtc-data-api/
// have to fix the chrome hardcoded sdp value to speed up data transfers
// ONLY APPLIES TO CHROME VERSIONS BEFORE 2013, REMOVE
// function patchSDP(offer) {
//   let split = offer.sdp.split("b=AS:30");
//   let newSDP = (split.length > 1) ? split[0] + "b=AS:1638400" + split[1] : offer.sdp;
//   // console.log(offer.sdp);
//   // console.log(newSDP);
//   offer.sdp = newSDP;
// }
