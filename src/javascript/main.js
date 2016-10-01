window.onload = main;

function main() {
  let config = {};
  config.constraints = {
    audio: false,
    video: {
      width: { exact: 1280 },
      height: { exact: 720 }
    }
  }
  console.log("created RTCPeerConnection");
  let connection = new RTCPeerConnection(config.RTCconfig);

  bindICECandidateHandler(connection);

  connection.ondatachannel = (event) => {
    console.log("recieved data channel");
    event.channel.onopen = () => {
      console.log("data channel open");
    }
  }
}

function bindICECandidateHandler(connection) {
  connection.onicecandidate = (event) => {
    if (event.candidate) {
      sendICECandidate(event.candidate); // trickle ICE candidates
      console.log("sent ICE candidate");
    }
    else {
      console.log("no more ICE candidates");
    }
  }
}

function sendICECandidate(candidate) {
  // implement
}
