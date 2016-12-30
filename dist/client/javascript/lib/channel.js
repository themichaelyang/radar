'use strict';

(function () {
  function createChannel() {
    var channel = {};
    channel.config;
    channel.dataChannel;
    channel.roomName;
    channel.peerConnection;

    var socket = void 0;

    // if variables are defined outside of methods, they become shared/static
    var DEFAULT_CONFIG = {};
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

    channel.init = function () {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_CONFIG;

      socket = io('https://hoverhand.herokuapp.com/');
      channel.config = config;
    };

    function joinRoom(roomName) {
      return new Promise(function (resolve, reject) {
        // todo: make signaling more generic
        socket.emit('join_room', { 'roomName': roomName });

        var connectionTimeoutId = setTimeout(function () {
          reject(new Error('Connection timeout: joinRoom()'));
        }, channel.config.timeout); // make this value configurable
        socket.on('joined_room', function (data) {
          print('Room "' + data.roomName + '" joined, ' + data.totalConnections + ' total connections.');
          clearTimeout(connectionTimeoutId);

          channel.clientId = data.clientId;
          channel.roomName = data.roomName;
          resolve(data);
        });
      });
    };

    channel.connect = function (roomName) {
      channel.peerConnection = new RTCPeerConnection(channel.config.peerConnection);
      print('Created RTCPeerConnection');

      // todo: move all communications into one function
      socket.on('remote_session_description', function (data) {
        receiveDescription(channel.peerConnection, data.description);
      });

      return new Promise(function (resolve, reject) {
        joinRoom(roomName).then(function (data) {
          var isCaller = data.totalConnections === 2;

          bindICECandidateHandlers(channel.peerConnection);
          return brokerConnection(isCaller);
        }).then(function (dataChannel) {
          // on opened

          channel.dataChannel = dataChannel;

          resolve(dataChannel);
        });
      });
    };

    channel.on = function (eventName, callback) {
      if (eventName === 'open') {
        channel.onOpen = callback;
      } else if (eventName === 'close') {
        channel.onClose = callback;
      } else if (eventName === 'message') {
        channel.onMessage = callback;
      } else if (eventName === 'error') {
        channel.onError = callback;
      }

      bindDataChannelHandlers(channel.dataChannel);
    };

    channel.send = function (message) {
      if (channel.dataChannel) {
        // should just queue messages
        channel.dataChannel.send(message);
      }
    };

    // should return a promise
    function brokerConnection(calling) {
      return new Promise(function (resolve, reject) {
        if (calling) {
          (function () {
            var dataChannel = channel.peerConnection.createDataChannel(channel.roomName || "", channel.config.dataChannel);

            makeOffer(channel.peerConnection);

            dataChannel.addEventListener('open', function (event) {
              bindDataChannelHandlers(dataChannel);
              resolve(dataChannel);
            });
          })();
        } else {
          awaitDataChannel(channel.peerConnection).then(function (dataChannel) {
            print('Received RTCDataChannel');
            dataChannel.addEventListener('open', function (event) {
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
      return new Promise(function (resolve, reject) {
        connection.ondatachannel = function (event) {
          // ondatachannel means the data channel is visible, not that it is ready to send
          var dataChannel = event.channel;
          resolve(dataChannel);
        };
      });
    }

    // could combine makeOffer and makeAnswer
    function makeOffer(connection) {
      connection.createOffer(channel.config.offer).then(function (offer) {
        return connection.setLocalDescription(offer);
      }).then(function () {
        return sendDescription(connection.localDescription);
      }).catch(function (error) {
        return console.error('createOffer() or setLocalDescription() failed: ' + error);
      });
      print('Made and sent offer');
    }

    function makeAnswer(connection) {
      connection.createAnswer(channel.config.offer).then(function (answer) {
        return connection.setLocalDescription(answer);
      }).then(function () {
        return sendDescription(connection.localDescription);
      }).catch(function (error) {
        return console.error('createAnswer() or setLocalDescription() failed: ' + error);
      });
      print('Made and sent answer');
    }

    function sendDescription(offer) {
      // implement
      socket.emit('send_session_description', { description: offer });
      print('Sent session description');
    }

    function receiveDescription(connection, receivedDescription) {
      connection.setRemoteDescription(receivedDescription).then(function () {
        print('Received and set remoteDescription');
        // print(connection.localDescription);
        if (!isEmptyDescription(connection.localDescription)) {
          // technically should be null before set, according to spec
          // if theres local desc, should be caller
          // idk what it should do tbh
          // print('Should be connected if ICE is done');
        } else {
          // should be callee (answering)
          makeAnswer(connection);
        }
      });
    }

    function bindICECandidateHandlers(connection) {
      connection.onicecandidate = function (event) {
        if (event.candidate) {
          sendICECandidate(event.candidate); // trickle ICE candidates
          print('Sent an ICE candidate');
        } else {
          print('Finished sending ICE candidates');
        }
      };

      socket.on('remote_ICE_candidate', function (data) {
        connection.addIceCandidate(data.candidate).then(function () {
          print('Added ICE candidate');
        }).catch(function (error) {
          return console.error(error);
        });
      });
    }

    function sendICECandidate(candidate) {
      socket.emit('send_ICE_candidate', { candidate: candidate });
    }

    function isEmptyDescription(description) {
      return !(description.type && description.sdp);
    }

    function print() {
      var _console;

      (_console = console).log.apply(_console, arguments);
    }

    // consider using revealing module pattern
    return channel;
  };

  var channel = createChannel();

  // use a traditional constructor function
  // to use same prototype object, save memory
  window.Channel = function (config) {
    var obj = Object.create(channel);
    obj.init(config);
    return obj;
  };
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvbGliL2NoYW5uZWwuanMiXSwibmFtZXMiOlsiY3JlYXRlQ2hhbm5lbCIsImNoYW5uZWwiLCJjb25maWciLCJkYXRhQ2hhbm5lbCIsInJvb21OYW1lIiwicGVlckNvbm5lY3Rpb24iLCJzb2NrZXQiLCJERUZBVUxUX0NPTkZJRyIsImljZVNlcnZlcnMiLCJ1cmxzIiwib2ZmZXIiLCJvcmRlcmVkIiwibWF4UGFja2V0TGlmZVRpbWUiLCJtYXhSZXRyYW5zbWl0cyIsInRpbWVvdXQiLCJpbml0IiwiaW8iLCJqb2luUm9vbSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZW1pdCIsImNvbm5lY3Rpb25UaW1lb3V0SWQiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJvbiIsImRhdGEiLCJwcmludCIsInRvdGFsQ29ubmVjdGlvbnMiLCJjbGVhclRpbWVvdXQiLCJjbGllbnRJZCIsImNvbm5lY3QiLCJSVENQZWVyQ29ubmVjdGlvbiIsInJlY2VpdmVEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uIiwidGhlbiIsImlzQ2FsbGVyIiwiYmluZElDRUNhbmRpZGF0ZUhhbmRsZXJzIiwiYnJva2VyQ29ubmVjdGlvbiIsImV2ZW50TmFtZSIsImNhbGxiYWNrIiwib25PcGVuIiwib25DbG9zZSIsIm9uTWVzc2FnZSIsIm9uRXJyb3IiLCJiaW5kRGF0YUNoYW5uZWxIYW5kbGVycyIsInNlbmQiLCJtZXNzYWdlIiwiY2FsbGluZyIsImNyZWF0ZURhdGFDaGFubmVsIiwibWFrZU9mZmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiYXdhaXREYXRhQ2hhbm5lbCIsIm9ubWVzc2FnZSIsIm9ub3BlbiIsIm9uY2xvc2UiLCJvbmVycm9yIiwiY29ubmVjdGlvbiIsIm9uZGF0YWNoYW5uZWwiLCJjcmVhdGVPZmZlciIsInNldExvY2FsRGVzY3JpcHRpb24iLCJzZW5kRGVzY3JpcHRpb24iLCJsb2NhbERlc2NyaXB0aW9uIiwiY2F0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJtYWtlQW5zd2VyIiwiY3JlYXRlQW5zd2VyIiwiYW5zd2VyIiwicmVjZWl2ZWREZXNjcmlwdGlvbiIsInNldFJlbW90ZURlc2NyaXB0aW9uIiwiaXNFbXB0eURlc2NyaXB0aW9uIiwib25pY2VjYW5kaWRhdGUiLCJjYW5kaWRhdGUiLCJzZW5kSUNFQ2FuZGlkYXRlIiwiYWRkSWNlQ2FuZGlkYXRlIiwidHlwZSIsInNkcCIsImxvZyIsIndpbmRvdyIsIkNoYW5uZWwiLCJvYmoiLCJPYmplY3QiLCJjcmVhdGUiXSwibWFwcGluZ3MiOiI7O0FBQUMsYUFBVztBQUNWLFdBQVNBLGFBQVQsR0FBeUI7QUFDdkIsUUFBSUMsVUFBVSxFQUFkO0FBQ0FBLFlBQVFDLE1BQVI7QUFDQUQsWUFBUUUsV0FBUjtBQUNBRixZQUFRRyxRQUFSO0FBQ0FILFlBQVFJLGNBQVI7O0FBRUEsUUFBSUMsZUFBSjs7QUFFQTtBQUNBLFFBQU1DLGlCQUFpQixFQUF2QjtBQUNBQSxtQkFBZUYsY0FBZixHQUFnQztBQUM5Qkcsa0JBQVksQ0FBQztBQUNYQyxjQUFNO0FBREssT0FBRDtBQURrQixLQUFoQztBQUtBRixtQkFBZUcsS0FBZixHQUF1QixFQUF2QjtBQUNBSCxtQkFBZUosV0FBZixHQUE2QjtBQUMzQlEsZUFBUyxLQURrQixFQUNYO0FBQ2hCQyx5QkFBbUIsR0FGUSxFQUVIO0FBQ3hCQyxzQkFBZ0IsQ0FIVyxDQUdUO0FBSFMsS0FBN0I7QUFLQU4sbUJBQWVPLE9BQWYsR0FBeUIsS0FBekIsQ0F0QnVCLENBc0JTOztBQUVoQ2IsWUFBUWMsSUFBUixHQUFlLFlBQWtDO0FBQUEsVUFBekJiLE1BQXlCLHVFQUFoQkssY0FBZ0I7O0FBQy9DRCxlQUFTVSxHQUFHLGtDQUFILENBQVQ7QUFDQWYsY0FBUUMsTUFBUixHQUFpQkEsTUFBakI7QUFDRCxLQUhEOztBQUtBLGFBQVNlLFFBQVQsQ0FBa0JiLFFBQWxCLEVBQTRCO0FBQzFCLGFBQU8sSUFBSWMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFx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R0FBaUIsVUFBUy9FLE1BQVQsRUFBaUI7QUFDaEMsUUFBSWdGLE1BQU1DLE9BQU9DLE1BQVAsQ0FBY25GLE9BQWQsQ0FBVjtBQUNBaUYsUUFBSW5FLElBQUosQ0FBU2IsTUFBVDtBQUNBLFdBQU9nRixHQUFQO0FBQ0QsR0FKRDtBQUtELENBbk9BLEdBQUQiLCJmaWxlIjoiamF2YXNjcmlwdC9saWIvY2hhbm5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gY3JlYXRlQ2hhbm5lbCgpIHtcbiAgICBsZXQgY2hhbm5lbCA9IHt9O1xuICAgIGNoYW5uZWwuY29uZmlnO1xuICAgIGNoYW5uZWwuZGF0YUNoYW5uZWw7XG4gICAgY2hhbm5lbC5yb29tTmFtZTtcbiAgICBjaGFubmVsLnBlZXJDb25uZWN0aW9uO1xuXG4gICAgbGV0IHNvY2tldDtcblxuICAgIC8vIGlmIHZhcmlhYmxlcyBhcmUgZGVmaW5lZCBvdXRzaWRlIG9mIG1ldGhvZHMsIHRoZXkgYmVjb21lIHNoYXJlZC9zdGF0aWNcbiAgICBjb25zdCBERUZBVUxUX0NPTkZJRyA9IHt9O1xuICAgIERFRkFVTFRfQ09ORklHLnBlZXJDb25uZWN0aW9uID0ge1xuICAgICAgaWNlU2VydmVyczogW3tcbiAgICAgICAgdXJsczogJ3N0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDInXG4gICAgICB9XVxuICAgIH07XG4gICAgREVGQVVMVF9DT05GSUcub2ZmZXIgPSB7fTtcbiAgICBERUZBVUxUX0NPTkZJRy5kYXRhQ2hhbm5lbCA9IHtcbiAgICAgIG9yZGVyZWQ6IGZhbHNlLCAvLyB1bnJlbGlhYmxlIGRhdGEgY2hhbm5lbFxuICAgICAgbWF4UGFja2V0TGlmZVRpbWU6IDEwMCwgLy8gbWlsbGlzXG4gICAgICBtYXhSZXRyYW5zbWl0czogMCAvLyBkb24ndCBzZW5kIGFnYWluXG4gICAgfTtcbiAgICBERUZBVUxUX0NPTkZJRy50aW1lb3V0ID0gMTAwMDA7IC8vIDEwIHNlY29uZHNcblxuICAgIGNoYW5uZWwuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZyA9IERFRkFVTFRfQ09ORklHKSB7XG4gICAgICBzb2NrZXQgPSBpbygnaHR0cHM6Ly9ob3ZlcmhhbmQuaGVyb2t1YXBwLmNvbS8nKTtcbiAgICAgIGNoYW5uZWwuY29uZmlnID0gY29uZmlnO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBqb2luUm9vbShyb29tTmFtZSkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gdG9kbzogbWFrZSBzaWduYWxpbmcgbW9yZSBnZW5lcmljXG4gICAgICAgIHNvY2tldC5lbWl0KCdqb2luX3Jvb20nLCB7J3Jvb21OYW1lJzogcm9vbU5hbWV9KTtcblxuICAgICAgICBsZXQgY29ubmVjdGlvblRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gdGltZW91dDogam9pblJvb20oKScpKTtcbiAgICAgICAgfSwgY2hhbm5lbC5jb25maWcudGltZW91dCk7IC8vIG1ha2UgdGhpcyB2YWx1ZSBjb25maWd1cmFibGVcbiAgICAgICAgc29ja2V0Lm9uKCdqb2luZWRfcm9vbScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgcHJpbnQoJ1Jvb20gXCInICsgZGF0YS5yb29tTmFtZSArICdcIiBqb2luZWQsICcrIGRhdGEudG90YWxDb25uZWN0aW9ucyArJyB0b3RhbCBjb25uZWN0aW9ucy4nKTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXRJZCk7XG5cbiAgICAgICAgICBjaGFubmVsLmNsaWVudElkID0gZGF0YS5jbGllbnRJZDtcbiAgICAgICAgICBjaGFubmVsLnJvb21OYW1lID0gZGF0YS5yb29tTmFtZTtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjaGFubmVsLmNvbm5lY3QgPSBmdW5jdGlvbihyb29tTmFtZSkge1xuICAgICAgY2hhbm5lbC5wZWVyQ29ubmVjdGlvbiA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihjaGFubmVsLmNvbmZpZy5wZWVyQ29ubmVjdGlvbik7XG4gICAgICBwcmludCgnQ3JlYXRlZCBSVENQZWVyQ29ubmVjdGlvbicpO1xuXG4gICAgICAvLyB0b2RvOiBtb3ZlIGFsbCBjb21tdW5pY2F0aW9ucyBpbnRvIG9uZSBmdW5jdGlvblxuICAgICAgc29ja2V0Lm9uKCdyZW1vdGVfc2Vzc2lvbl9kZXNjcmlwdGlvbicsIChkYXRhKSA9PiB7XG4gICAgICAgIHJlY2VpdmVEZXNjcmlwdGlvbihjaGFubmVsLnBlZXJDb25uZWN0aW9uLCBkYXRhLmRlc2NyaXB0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBqb2luUm9vbShyb29tTmFtZSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgIGxldCBpc0NhbGxlciA9IChkYXRhLnRvdGFsQ29ubmVjdGlvbnMgPT09IDIpO1xuXG4gICAgICAgICAgYmluZElDRUNhbmRpZGF0ZUhhbmRsZXJzKGNoYW5uZWwucGVlckNvbm5lY3Rpb24pO1xuICAgICAgICAgIHJldHVybiBicm9rZXJDb25uZWN0aW9uKGlzQ2FsbGVyKTtcbiAgICAgICAgfSkudGhlbigoZGF0YUNoYW5uZWwpID0+IHsgLy8gb24gb3BlbmVkXG5cbiAgICAgICAgICBjaGFubmVsLmRhdGFDaGFubmVsID0gZGF0YUNoYW5uZWw7XG5cbiAgICAgICAgICByZXNvbHZlKGRhdGFDaGFubmVsKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY2hhbm5lbC5vbiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmIChldmVudE5hbWUgPT09ICdvcGVuJykge1xuICAgICAgICBjaGFubmVsLm9uT3BlbiA9IGNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXZlbnROYW1lID09PSAnY2xvc2UnKSB7XG4gICAgICAgIGNoYW5uZWwub25DbG9zZSA9IGNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXZlbnROYW1lID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgY2hhbm5lbC5vbk1lc3NhZ2UgPSBjYWxsYmFjaztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50TmFtZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICBjaGFubmVsLm9uRXJyb3IgPSBjYWxsYmFjaztcbiAgICAgIH1cblxuICAgICAgYmluZERhdGFDaGFubmVsSGFuZGxlcnMoY2hhbm5lbC5kYXRhQ2hhbm5lbCk7XG4gICAgfTtcblxuICAgIGNoYW5uZWwuc2VuZCA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGlmIChjaGFubmVsLmRhdGFDaGFubmVsKSB7IC8vIHNob3VsZCBqdXN0IHF1ZXVlIG1lc3NhZ2VzXG4gICAgICAgIGNoYW5uZWwuZGF0YUNoYW5uZWwuc2VuZChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gc2hvdWxkIHJldHVybiBhIHByb21pc2VcbiAgICBmdW5jdGlvbiBicm9rZXJDb25uZWN0aW9uKGNhbGxpbmcpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmIChjYWxsaW5nKSB7XG4gICAgICAgICAgbGV0IGRhdGFDaGFubmVsID0gY2hhbm5lbC5wZWVyQ29ubmVjdGlvbi5jcmVhdGVEYXRhQ2hhbm5lbChjaGFubmVsLnJvb21OYW1lIHx8IFwiXCIsIGNoYW5uZWwuY29uZmlnLmRhdGFDaGFubmVsKTtcblxuICAgICAgICAgIG1ha2VPZmZlcihjaGFubmVsLnBlZXJDb25uZWN0aW9uKTtcblxuICAgICAgICAgIGRhdGFDaGFubmVsLmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGJpbmREYXRhQ2hhbm5lbEhhbmRsZXJzKGRhdGFDaGFubmVsKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YUNoYW5uZWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGF3YWl0RGF0YUNoYW5uZWwoY2hhbm5lbC5wZWVyQ29ubmVjdGlvbikudGhlbigoZGF0YUNoYW5uZWwpID0+IHtcbiAgICAgICAgICAgIHByaW50KCdSZWNlaXZlZCBSVENEYXRhQ2hhbm5lbCcpO1xuICAgICAgICAgICAgZGF0YUNoYW5uZWwuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICBiaW5kRGF0YUNoYW5uZWxIYW5kbGVycyhkYXRhQ2hhbm5lbCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoZGF0YUNoYW5uZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJpbmREYXRhQ2hhbm5lbEhhbmRsZXJzKGRhdGFDaGFubmVsKSB7XG4gICAgICBpZiAoZGF0YUNoYW5uZWwpIHtcbiAgICAgICAgZGF0YUNoYW5uZWwub25tZXNzYWdlID0gY2hhbm5lbC5vbk1lc3NhZ2U7XG4gICAgICAgIGRhdGFDaGFubmVsLm9ub3BlbiA9IGNoYW5uZWwub25PcGVuO1xuICAgICAgICBkYXRhQ2hhbm5lbC5vbmNsb3NlID0gY2hhbm5lbC5vbkNsb3NlO1xuICAgICAgICBkYXRhQ2hhbm5lbC5vbmVycm9yID0gY2hhbm5lbC5vbkVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGF3YWl0RGF0YUNoYW5uZWwoY29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29ubmVjdGlvbi5vbmRhdGFjaGFubmVsID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgLy8gb25kYXRhY2hhbm5lbCBtZWFucyB0aGUgZGF0YSBjaGFubmVsIGlzIHZpc2libGUsIG5vdCB0aGF0IGl0IGlzIHJlYWR5IHRvIHNlbmRcbiAgICAgICAgICBsZXQgZGF0YUNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgICAgIHJlc29sdmUoZGF0YUNoYW5uZWwpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gY291bGQgY29tYmluZSBtYWtlT2ZmZXIgYW5kIG1ha2VBbnN3ZXJcbiAgICBmdW5jdGlvbiBtYWtlT2ZmZXIoY29ubmVjdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5jcmVhdGVPZmZlcihjaGFubmVsLmNvbmZpZy5vZmZlcilcbiAgICAgIC50aGVuKChvZmZlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbi5zZXRMb2NhbERlc2NyaXB0aW9uKG9mZmVyKVxuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHNlbmREZXNjcmlwdGlvbihjb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pKVxuICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoJ2NyZWF0ZU9mZmVyKCkgb3Igc2V0TG9jYWxEZXNjcmlwdGlvbigpIGZhaWxlZDogJytlcnJvcikpO1xuICAgICAgcHJpbnQoJ01hZGUgYW5kIHNlbnQgb2ZmZXInKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlQW5zd2VyKGNvbm5lY3Rpb24pIHtcbiAgICAgIGNvbm5lY3Rpb24uY3JlYXRlQW5zd2VyKGNoYW5uZWwuY29uZmlnLm9mZmVyKVxuICAgICAgLnRoZW4oYW5zd2VyID0+IHsgcmV0dXJuIGNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihhbnN3ZXIpIH0pXG4gICAgICAudGhlbigoKSA9PiBzZW5kRGVzY3JpcHRpb24oY29ubmVjdGlvbi5sb2NhbERlc2NyaXB0aW9uKSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKCdjcmVhdGVBbnN3ZXIoKSBvciBzZXRMb2NhbERlc2NyaXB0aW9uKCkgZmFpbGVkOiAnK2Vycm9yKSk7XG4gICAgICBwcmludCgnTWFkZSBhbmQgc2VudCBhbnN3ZXInKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kRGVzY3JpcHRpb24ob2ZmZXIpIHtcbiAgICAgIC8vIGltcGxlbWVudFxuICAgICAgc29ja2V0LmVtaXQoJ3NlbmRfc2Vzc2lvbl9kZXNjcmlwdGlvbicsIHtkZXNjcmlwdGlvbjogb2ZmZXJ9KTtcbiAgICAgIHByaW50KCdTZW50IHNlc3Npb24gZGVzY3JpcHRpb24nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWNlaXZlRGVzY3JpcHRpb24oY29ubmVjdGlvbiwgcmVjZWl2ZWREZXNjcmlwdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihyZWNlaXZlZERlc2NyaXB0aW9uKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBwcmludCgnUmVjZWl2ZWQgYW5kIHNldCByZW1vdGVEZXNjcmlwdGlvbicpO1xuICAgICAgICAvLyBwcmludChjb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pO1xuICAgICAgICBpZiAoIWlzRW1wdHlEZXNjcmlwdGlvbihjb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pKSB7XG4gICAgICAgICAgLy8gdGVjaG5pY2FsbHkgc2hvdWxkIGJlIG51bGwgYmVmb3JlIHNldCwgYWNjb3JkaW5nIHRvIHNwZWNcbiAgICAgICAgICAvLyBpZiB0aGVyZXMgbG9jYWwgZGVzYywgc2hvdWxkIGJlIGNhbGxlclxuICAgICAgICAgIC8vIGlkayB3aGF0IGl0IHNob3VsZCBkbyB0YmhcbiAgICAgICAgICAvLyBwcmludCgnU2hvdWxkIGJlIGNvbm5lY3RlZCBpZiBJQ0UgaXMgZG9uZScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIHNob3VsZCBiZSBjYWxsZWUgKGFuc3dlcmluZylcbiAgICAgICAgICBtYWtlQW5zd2VyKGNvbm5lY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiaW5kSUNFQ2FuZGlkYXRlSGFuZGxlcnMoY29ubmVjdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5vbmljZWNhbmRpZGF0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSB7XG4gICAgICAgICAgc2VuZElDRUNhbmRpZGF0ZShldmVudC5jYW5kaWRhdGUpOyAvLyB0cmlja2xlIElDRSBjYW5kaWRhdGVzXG4gICAgICAgICAgcHJpbnQoJ1NlbnQgYW4gSUNFIGNhbmRpZGF0ZScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHByaW50KCdGaW5pc2hlZCBzZW5kaW5nIElDRSBjYW5kaWRhdGVzJyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHNvY2tldC5vbigncmVtb3RlX0lDRV9jYW5kaWRhdGUnLCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25uZWN0aW9uLmFkZEljZUNhbmRpZGF0ZShkYXRhLmNhbmRpZGF0ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcHJpbnQoJ0FkZGVkIElDRSBjYW5kaWRhdGUnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbmRJQ0VDYW5kaWRhdGUoY2FuZGlkYXRlKSB7XG4gICAgICBzb2NrZXQuZW1pdCgnc2VuZF9JQ0VfY2FuZGlkYXRlJywge2NhbmRpZGF0ZTogY2FuZGlkYXRlfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNFbXB0eURlc2NyaXB0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICByZXR1cm4gIShkZXNjcmlwdGlvbi50eXBlICYmIGRlc2NyaXB0aW9uLnNkcCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnQoLi4uc3RyKSB7XG4gICAgICBjb25zb2xlLmxvZyguLi5zdHIpO1xuICAgIH1cblxuICAgIC8vIGNvbnNpZGVyIHVzaW5nIHJldmVhbGluZyBtb2R1bGUgcGF0dGVyblxuICAgIHJldHVybiBjaGFubmVsO1xuICB9O1xuXG4gIGxldCBjaGFubmVsID0gY3JlYXRlQ2hhbm5lbCgpO1xuXG4gIC8vIHVzZSBhIHRyYWRpdGlvbmFsIGNvbnN0cnVjdG9yIGZ1bmN0aW9uXG4gIC8vIHRvIHVzZSBzYW1lIHByb3RvdHlwZSBvYmplY3QsIHNhdmUgbWVtb3J5XG4gIHdpbmRvdy5DaGFubmVsID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgbGV0IG9iaiA9IE9iamVjdC5jcmVhdGUoY2hhbm5lbCk7XG4gICAgb2JqLmluaXQoY29uZmlnKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xufSgpKTtcbiJdfQ==
