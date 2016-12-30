(function() {
  function createChannel() {
    let channel = {};
    channel.config;
    channel.dataChannel;
    channel.roomName;
    channel.peerConnection;

    let socket;

    // if variables are defined outside of methods, they become shared/static
    const DEFAULT_CONFIG = {};
    DEFAULT_CONFIG.peerConnection = {
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
      }]
    };
    DEFAULT_CONFIG.offer = {};
    DEFAULT_CONFIG.dataChannel = {
      ordered: false, // unreliable data channel
      maxPacketLifeTime: 100, // millis
      maxRetransmits: 0 // don't send again
    };
    DEFAULT_CONFIG.timeout = 10000; // 10 seconds

    channel.init = function(config = DEFAULT_CONFIG) {
      socket = io('https://hoverhand.herokuapp.com/');
      channel.config = config;
    };

    function joinRoom(roomName) {
      return new Promise((resolve, reject) => {
        // todo: make signaling more generic
        socket.emit('join_room', {'roomName': roomName});

        let connectionTimeoutId = setTimeout(() => {
          reject(new Error('Connection timeout: joinRoom()'));
        }, channel.config.timeout); // make this value configurable
        socket.on('joined_room', (data) => {
          print('Room "' + data.roomName + '" joined, '+ data.totalConnections +' total connections.');
          clearTimeout(connectionTimeoutId);

          channel.clientId = data.clientId;
          channel.roomName = data.roomName;
          resolve(data);
        });
      });
    };

    channel.connect = function(roomName) {
      channel.peerConnection = new RTCPeerConnection(channel.config.peerConnection);
      print('Created RTCPeerConnection');

      // todo: move all communications into one function
      socket.on('remote_session_description', (data) => {
        receiveDescription(channel.peerConnection, data.description);
      });

      return new Promise((resolve, reject) => {
        joinRoom(roomName).then((data) => {
          let isCaller = (data.totalConnections === 2);

          bindICECandidateHandlers(channel.peerConnection);
          return brokerConnection(isCaller);
        }).then((dataChannel) => { // on opened

          channel.dataChannel = dataChannel;

          resolve(dataChannel);
        });
      });
    };

    channel.on = function(eventName, callback) {
      if (eventName === 'open') {
        channel.onOpen = callback;
      }
      else if (eventName === 'close') {
        channel.onClose = callback;
      }
      else if (eventName === 'message') {
        channel.onMessage = callback;
      }
      else if (eventName === 'error') {
        channel.onError = callback;
      }

      bindDataChannelHandlers(channel.dataChannel);
    };

    channel.send = function(message) {
      if (channel.dataChannel) { // should just queue messages
        channel.dataChannel.send(message);
      }
    };

    // should return a promise
    function brokerConnection(calling) {
      return new Promise((resolve, reject) => {
        if (calling) {
          let dataChannel = channel.peerConnection.createDataChannel(channel.roomName || "", channel.config.dataChannel);

          makeOffer(channel.peerConnection);

          dataChannel.addEventListener('open', (event) => {
            bindDataChannelHandlers(dataChannel);
            resolve(dataChannel);
          });
        }
        else {
          awaitDataChannel(channel.peerConnection).then((dataChannel) => {
            print('Received RTCDataChannel');
            dataChannel.addEventListener('open', (event) => {
              bindDataChannelHandlers(dataChannel);
              resolve(dataChannel);
            });
          });
        }
      });
    }

    function bindDataChannelHandlers(dataChannel) {
      if (dataChannel) {
        dataChannel.onmessage = channel.onMessage;
        dataChannel.onopen = channel.onOpen;
        dataChannel.onclose = channel.onClose;
        dataChannel.onerror = channel.onError;
      }
    }

    function awaitDataChannel(connection) {
      return new Promise((resolve, reject) => {
        connection.ondatachannel = (event) => {
          // ondatachannel means the data channel is visible, not that it is ready to send
          let dataChannel = event.channel;
          resolve(dataChannel);
        };
      });
    }

    // could combine makeOffer and makeAnswer
    function makeOffer(connection) {
      connection.createOffer(channel.config.offer)
      .then((offer) => {
        return connection.setLocalDescription(offer)
      })
      .then(() => sendDescription(connection.localDescription))
      .catch(error => console.error('createOffer() or setLocalDescription() failed: '+error));
      print('Made and sent offer');
    }

    function makeAnswer(connection) {
      connection.createAnswer(channel.config.offer)
      .then(answer => { return connection.setLocalDescription(answer) })
      .then(() => sendDescription(connection.localDescription))
      .catch(error => console.error('createAnswer() or setLocalDescription() failed: '+error));
      print('Made and sent answer');
    }

    function sendDescription(offer) {
      // implement
      socket.emit('send_session_description', {description: offer});
      print('Sent session description');
    }

    function receiveDescription(connection, receivedDescription) {
      connection.setRemoteDescription(receivedDescription)
      .then(() => {
        print('Received and set remoteDescription');
        // print(connection.localDescription);
        if (!isEmptyDescription(connection.localDescription)) {
          // technically should be null before set, according to spec
          // if theres local desc, should be caller
          // idk what it should do tbh
          // print('Should be connected if ICE is done');
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
          print('Sent an ICE candidate');
        }
        else {
          print('Finished sending ICE candidates');
        }
      };

      socket.on('remote_ICE_candidate', (data) => {
        connection.addIceCandidate(data.candidate).then(() => {
          print('Added ICE candidate');
        })
        .catch(error => console.error(error));
      });
    }

    function sendICECandidate(candidate) {
      socket.emit('send_ICE_candidate', {candidate: candidate});
    }

    function isEmptyDescription(description) {
      return !(description.type && description.sdp);
    }

    function print(...str) {
      console.log(...str);
    }

    // consider using revealing module pattern
    return channel;
  };

  let channel = createChannel();

  // use a traditional constructor function
  // to use same prototype object, save memory
  window.Channel = function(config) {
    let obj = Object.create(channel);
    obj.init(config);
    return obj;
  };
}());
