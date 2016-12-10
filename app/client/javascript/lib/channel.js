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

      socket = io();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQvbGliL2NoYW5uZWwuanMiXSwibmFtZXMiOlsiY3JlYXRlQ2hhbm5lbCIsImNoYW5uZWwiLCJjb25maWciLCJkYXRhQ2hhbm5lbCIsInJvb21OYW1lIiwicGVlckNvbm5lY3Rpb24iLCJzb2NrZXQiLCJERUZBVUxUX0NPTkZJRyIsImljZVNlcnZlcnMiLCJ1cmxzIiwib2ZmZXIiLCJvcmRlcmVkIiwibWF4UGFja2V0TGlmZVRpbWUiLCJtYXhSZXRyYW5zbWl0cyIsInRpbWVvdXQiLCJpbml0IiwiaW8iLCJqb2luUm9vbSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZW1pdCIsImNvbm5lY3Rpb25UaW1lb3V0SWQiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJvbiIsImRhdGEiLCJwcmludCIsInRvdGFsQ29ubmVjdGlvbnMiLCJjbGVhclRpbWVvdXQiLCJjbGllbnRJZCIsImNvbm5lY3QiLCJSVENQZWVyQ29ubmVjdGlvbiIsInJlY2VpdmVEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uIiwidGhlbiIsImlzQ2FsbGVyIiwiYmluZElDRUNhbmRpZGF0ZUhhbmRsZXJzIiwiYnJva2VyQ29ubmVjdGlvbiIsImV2ZW50TmFtZSIsImNhbGxiYWNrIiwib25PcGVuIiwib25DbG9zZSIsIm9uTWVzc2FnZSIsIm9uRXJyb3IiLCJiaW5kRGF0YUNoYW5uZWxIYW5kbGVycyIsInNlbmQiLCJtZXNzYWdlIiwiY2FsbGluZyIsImNyZWF0ZURhdGFDaGFubmVsIiwibWFrZU9mZmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiYXdhaXREYXRhQ2hhbm5lbCIsIm9ubWVzc2FnZSIsIm9ub3BlbiIsIm9uY2xvc2UiLCJvbmVycm9yIiwiY29ubmVjdGlvbiIsIm9uZGF0YWNoYW5uZWwiLCJjcmVhdGVPZmZlciIsInNldExvY2FsRGVzY3JpcHRpb24iLCJzZW5kRGVzY3JpcHRpb24iLCJsb2NhbERlc2NyaXB0aW9uIiwiY2F0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJtYWtlQW5zd2VyIiwiY3JlYXRlQW5zd2VyIiwiYW5zd2VyIiwicmVjZWl2ZWREZXNjcmlwdGlvbiIsInNldFJlbW90ZURlc2NyaXB0aW9uIiwiaXNFbXB0eURlc2NyaXB0aW9uIiwib25pY2VjYW5kaWRhdGUiLCJjYW5kaWRhdGUiLCJzZW5kSUNFQ2FuZGlkYXRlIiwiYWRkSWNlQ2FuZGlkYXRlIiwidHlwZSIsInNkcCIsImxvZyIsIndpbmRvdyIsIkNoYW5uZWwiLCJvYmoiLCJPYmplY3QiLCJjcmVhdGUiXSwibWFwcGluZ3MiOiI7O0FBQUMsYUFBVztBQUNWLFdBQVNBLGFBQVQsR0FBeUI7QUFDdkIsUUFBSUMsVUFBVSxFQUFkO0FBQ0FBLFlBQVFDLE1BQVI7QUFDQUQsWUFBUUUsV0FBUjtBQUNBRixZQUFRRyxRQUFSO0FBQ0FILFlBQVFJLGNBQVI7O0FBRUEsUUFBSUMsZUFBSjs7QUFFQTtBQUNBLFFBQU1DLGlCQUFpQixFQUF2QjtBQUNBQSxtQkFBZUYsY0FBZixHQUFnQztBQUM5Qkcsa0JBQVksQ0FBQztBQUNYQyxjQUFNO0FBREssT0FBRDtBQURrQixLQUFoQztBQUtBRixtQkFBZUcsS0FBZixHQUF1QixFQUF2QjtBQUNBSCxtQkFBZUosV0FBZixHQUE2QjtBQUMzQlEsZUFBUyxLQURrQixFQUNYO0FBQ2hCQyx5QkFBbUIsR0FGUSxFQUVIO0FBQ3hCQyxzQkFBZ0IsQ0FIVyxDQUdUO0FBSFMsS0FBN0I7QUFLQU4sbUJBQWVPLE9BQWYsR0FBeUIsS0FBekIsQ0F0QnVCLENBc0JTOztBQUVoQ2IsWUFBUWMsSUFBUixHQUFlLFlBQWtDO0FBQUEsVUFBekJiLE1BQXlCLHVFQUFoQkssY0FBZ0I7O0FBQy9DRCxlQUFTVSxJQUFUO0FBQ0FmLGNBQVFDLE1BQVIsR0FBaUJBLE1BQWpCO0FBQ0QsS0FIRDs7QUFLQSxhQUFTZSxRQUFULENBQWtCYixRQUFsQixFQUE0QjtBQUMxQixhQUFPLElBQUljLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEM7QUFD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RSxNQUFULEVBQWlCO0FBQ2hDLFFBQUlnRixNQUFNQyxPQUFPQyxNQUFQLENBQWNuRixPQUFkLENBQVY7QUFDQWlGLFFBQUluRSxJQUFKLENBQVNiLE1BQVQ7QUFDQSxXQUFPZ0YsR0FBUDtBQUNELEdBSkQ7QUFLRCxDQW5PQSxHQUFEIiwiZmlsZSI6ImphdmFzY3JpcHQvbGliL2NoYW5uZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGNyZWF0ZUNoYW5uZWwoKSB7XG4gICAgbGV0IGNoYW5uZWwgPSB7fTtcbiAgICBjaGFubmVsLmNvbmZpZztcbiAgICBjaGFubmVsLmRhdGFDaGFubmVsO1xuICAgIGNoYW5uZWwucm9vbU5hbWU7XG4gICAgY2hhbm5lbC5wZWVyQ29ubmVjdGlvbjtcblxuICAgIGxldCBzb2NrZXQ7XG5cbiAgICAvLyBpZiB2YXJpYWJsZXMgYXJlIGRlZmluZWQgb3V0c2lkZSBvZiBtZXRob2RzLCB0aGV5IGJlY29tZSBzaGFyZWQvc3RhdGljXG4gICAgY29uc3QgREVGQVVMVF9DT05GSUcgPSB7fTtcbiAgICBERUZBVUxUX0NPTkZJRy5wZWVyQ29ubmVjdGlvbiA9IHtcbiAgICAgIGljZVNlcnZlcnM6IFt7XG4gICAgICAgIHVybHM6ICdzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyJ1xuICAgICAgfV1cbiAgICB9O1xuICAgIERFRkFVTFRfQ09ORklHLm9mZmVyID0ge307XG4gICAgREVGQVVMVF9DT05GSUcuZGF0YUNoYW5uZWwgPSB7XG4gICAgICBvcmRlcmVkOiBmYWxzZSwgLy8gdW5yZWxpYWJsZSBkYXRhIGNoYW5uZWxcbiAgICAgIG1heFBhY2tldExpZmVUaW1lOiAxMDAsIC8vIG1pbGxpc1xuICAgICAgbWF4UmV0cmFuc21pdHM6IDAgLy8gZG9uJ3Qgc2VuZCBhZ2FpblxuICAgIH07XG4gICAgREVGQVVMVF9DT05GSUcudGltZW91dCA9IDEwMDAwOyAvLyAxMCBzZWNvbmRzXG5cbiAgICBjaGFubmVsLmluaXQgPSBmdW5jdGlvbihjb25maWcgPSBERUZBVUxUX0NPTkZJRykge1xuICAgICAgc29ja2V0ID0gaW8oKTtcbiAgICAgIGNoYW5uZWwuY29uZmlnID0gY29uZmlnO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBqb2luUm9vbShyb29tTmFtZSkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gdG9kbzogbWFrZSBzaWduYWxpbmcgbW9yZSBnZW5lcmljXG4gICAgICAgIHNvY2tldC5lbWl0KCdqb2luX3Jvb20nLCB7J3Jvb21OYW1lJzogcm9vbU5hbWV9KTtcblxuICAgICAgICBsZXQgY29ubmVjdGlvblRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gdGltZW91dDogam9pblJvb20oKScpKTtcbiAgICAgICAgfSwgY2hhbm5lbC5jb25maWcudGltZW91dCk7IC8vIG1ha2UgdGhpcyB2YWx1ZSBjb25maWd1cmFibGVcbiAgICAgICAgc29ja2V0Lm9uKCdqb2luZWRfcm9vbScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgcHJpbnQoJ1Jvb20gXCInICsgZGF0YS5yb29tTmFtZSArICdcIiBqb2luZWQsICcrIGRhdGEudG90YWxDb25uZWN0aW9ucyArJyB0b3RhbCBjb25uZWN0aW9ucy4nKTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXRJZCk7XG5cbiAgICAgICAgICBjaGFubmVsLmNsaWVudElkID0gZGF0YS5jbGllbnRJZDtcbiAgICAgICAgICBjaGFubmVsLnJvb21OYW1lID0gZGF0YS5yb29tTmFtZTtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjaGFubmVsLmNvbm5lY3QgPSBmdW5jdGlvbihyb29tTmFtZSkge1xuICAgICAgY2hhbm5lbC5wZWVyQ29ubmVjdGlvbiA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihjaGFubmVsLmNvbmZpZy5wZWVyQ29ubmVjdGlvbik7XG4gICAgICBwcmludCgnQ3JlYXRlZCBSVENQZWVyQ29ubmVjdGlvbicpO1xuXG4gICAgICAvLyB0b2RvOiBtb3ZlIGFsbCBjb21tdW5pY2F0aW9ucyBpbnRvIG9uZSBmdW5jdGlvblxuICAgICAgc29ja2V0Lm9uKCdyZW1vdGVfc2Vzc2lvbl9kZXNjcmlwdGlvbicsIChkYXRhKSA9PiB7XG4gICAgICAgIHJlY2VpdmVEZXNjcmlwdGlvbihjaGFubmVsLnBlZXJDb25uZWN0aW9uLCBkYXRhLmRlc2NyaXB0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBqb2luUm9vbShyb29tTmFtZSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgIGxldCBpc0NhbGxlciA9IChkYXRhLnRvdGFsQ29ubmVjdGlvbnMgPT09IDIpO1xuXG4gICAgICAgICAgYmluZElDRUNhbmRpZGF0ZUhhbmRsZXJzKGNoYW5uZWwucGVlckNvbm5lY3Rpb24pO1xuICAgICAgICAgIHJldHVybiBicm9rZXJDb25uZWN0aW9uKGlzQ2FsbGVyKTtcbiAgICAgICAgfSkudGhlbigoZGF0YUNoYW5uZWwpID0+IHsgLy8gb24gb3BlbmVkXG5cbiAgICAgICAgICBjaGFubmVsLmRhdGFDaGFubmVsID0gZGF0YUNoYW5uZWw7XG5cbiAgICAgICAgICByZXNvbHZlKGRhdGFDaGFubmVsKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY2hhbm5lbC5vbiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmIChldmVudE5hbWUgPT09ICdvcGVuJykge1xuICAgICAgICBjaGFubmVsLm9uT3BlbiA9IGNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXZlbnROYW1lID09PSAnY2xvc2UnKSB7XG4gICAgICAgIGNoYW5uZWwub25DbG9zZSA9IGNhbGxiYWNrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXZlbnROYW1lID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgY2hhbm5lbC5vbk1lc3NhZ2UgPSBjYWxsYmFjaztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50TmFtZSA9PT0gJ2Vycm9yJykge1xuICAgICAgICBjaGFubmVsLm9uRXJyb3IgPSBjYWxsYmFjaztcbiAgICAgIH1cblxuICAgICAgYmluZERhdGFDaGFubmVsSGFuZGxlcnMoY2hhbm5lbC5kYXRhQ2hhbm5lbCk7XG4gICAgfTtcblxuICAgIGNoYW5uZWwuc2VuZCA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGlmIChjaGFubmVsLmRhdGFDaGFubmVsKSB7IC8vIHNob3VsZCBqdXN0IHF1ZXVlIG1lc3NhZ2VzXG4gICAgICAgIGNoYW5uZWwuZGF0YUNoYW5uZWwuc2VuZChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gc2hvdWxkIHJldHVybiBhIHByb21pc2VcbiAgICBmdW5jdGlvbiBicm9rZXJDb25uZWN0aW9uKGNhbGxpbmcpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmIChjYWxsaW5nKSB7XG4gICAgICAgICAgbGV0IGRhdGFDaGFubmVsID0gY2hhbm5lbC5wZWVyQ29ubmVjdGlvbi5jcmVhdGVEYXRhQ2hhbm5lbChjaGFubmVsLnJvb21OYW1lIHx8IFwiXCIsIGNoYW5uZWwuY29uZmlnLmRhdGFDaGFubmVsKTtcblxuICAgICAgICAgIG1ha2VPZmZlcihjaGFubmVsLnBlZXJDb25uZWN0aW9uKTtcblxuICAgICAgICAgIGRhdGFDaGFubmVsLmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGJpbmREYXRhQ2hhbm5lbEhhbmRsZXJzKGRhdGFDaGFubmVsKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YUNoYW5uZWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGF3YWl0RGF0YUNoYW5uZWwoY2hhbm5lbC5wZWVyQ29ubmVjdGlvbikudGhlbigoZGF0YUNoYW5uZWwpID0+IHtcbiAgICAgICAgICAgIHByaW50KCdSZWNlaXZlZCBSVENEYXRhQ2hhbm5lbCcpO1xuICAgICAgICAgICAgZGF0YUNoYW5uZWwuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICBiaW5kRGF0YUNoYW5uZWxIYW5kbGVycyhkYXRhQ2hhbm5lbCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoZGF0YUNoYW5uZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJpbmREYXRhQ2hhbm5lbEhhbmRsZXJzKGRhdGFDaGFubmVsKSB7XG4gICAgICBpZiAoZGF0YUNoYW5uZWwpIHtcbiAgICAgICAgZGF0YUNoYW5uZWwub25tZXNzYWdlID0gY2hhbm5lbC5vbk1lc3NhZ2U7XG4gICAgICAgIGRhdGFDaGFubmVsLm9ub3BlbiA9IGNoYW5uZWwub25PcGVuO1xuICAgICAgICBkYXRhQ2hhbm5lbC5vbmNsb3NlID0gY2hhbm5lbC5vbkNsb3NlO1xuICAgICAgICBkYXRhQ2hhbm5lbC5vbmVycm9yID0gY2hhbm5lbC5vbkVycm9yO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGF3YWl0RGF0YUNoYW5uZWwoY29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29ubmVjdGlvbi5vbmRhdGFjaGFubmVsID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgLy8gb25kYXRhY2hhbm5lbCBtZWFucyB0aGUgZGF0YSBjaGFubmVsIGlzIHZpc2libGUsIG5vdCB0aGF0IGl0IGlzIHJlYWR5IHRvIHNlbmRcbiAgICAgICAgICBsZXQgZGF0YUNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgICAgIHJlc29sdmUoZGF0YUNoYW5uZWwpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gY291bGQgY29tYmluZSBtYWtlT2ZmZXIgYW5kIG1ha2VBbnN3ZXJcbiAgICBmdW5jdGlvbiBtYWtlT2ZmZXIoY29ubmVjdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5jcmVhdGVPZmZlcihjaGFubmVsLmNvbmZpZy5vZmZlcilcbiAgICAgIC50aGVuKChvZmZlcikgPT4ge1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbi5zZXRMb2NhbERlc2NyaXB0aW9uKG9mZmVyKVxuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHNlbmREZXNjcmlwdGlvbihjb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pKVxuICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoJ2NyZWF0ZU9mZmVyKCkgb3Igc2V0TG9jYWxEZXNjcmlwdGlvbigpIGZhaWxlZDogJytlcnJvcikpO1xuICAgICAgcHJpbnQoJ01hZGUgYW5kIHNlbnQgb2ZmZXInKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlQW5zd2VyKGNvbm5lY3Rpb24pIHtcbiAgICAgIGNvbm5lY3Rpb24uY3JlYXRlQW5zd2VyKGNoYW5uZWwuY29uZmlnLm9mZmVyKVxuICAgICAgLnRoZW4oYW5zd2VyID0+IHsgcmV0dXJuIGNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihhbnN3ZXIpIH0pXG4gICAgICAudGhlbigoKSA9PiBzZW5kRGVzY3JpcHRpb24oY29ubmVjdGlvbi5sb2NhbERlc2NyaXB0aW9uKSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKCdjcmVhdGVBbnN3ZXIoKSBvciBzZXRMb2NhbERlc2NyaXB0aW9uKCkgZmFpbGVkOiAnK2Vycm9yKSk7XG4gICAgICBwcmludCgnTWFkZSBhbmQgc2VudCBhbnN3ZXInKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kRGVzY3JpcHRpb24ob2ZmZXIpIHtcbiAgICAgIC8vIGltcGxlbWVudFxuICAgICAgc29ja2V0LmVtaXQoJ3NlbmRfc2Vzc2lvbl9kZXNjcmlwdGlvbicsIHtkZXNjcmlwdGlvbjogb2ZmZXJ9KTtcbiAgICAgIHByaW50KCdTZW50IHNlc3Npb24gZGVzY3JpcHRpb24nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWNlaXZlRGVzY3JpcHRpb24oY29ubmVjdGlvbiwgcmVjZWl2ZWREZXNjcmlwdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihyZWNlaXZlZERlc2NyaXB0aW9uKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBwcmludCgnUmVjZWl2ZWQgYW5kIHNldCByZW1vdGVEZXNjcmlwdGlvbicpO1xuICAgICAgICAvLyBwcmludChjb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pO1xuICAgICAgICBpZiAoIWlzRW1wdHlEZXNjcmlwdGlvbihjb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pKSB7XG4gICAgICAgICAgLy8gdGVjaG5pY2FsbHkgc2hvdWxkIGJlIG51bGwgYmVmb3JlIHNldCwgYWNjb3JkaW5nIHRvIHNwZWNcbiAgICAgICAgICAvLyBpZiB0aGVyZXMgbG9jYWwgZGVzYywgc2hvdWxkIGJlIGNhbGxlclxuICAgICAgICAgIC8vIGlkayB3aGF0IGl0IHNob3VsZCBkbyB0YmhcbiAgICAgICAgICAvLyBwcmludCgnU2hvdWxkIGJlIGNvbm5lY3RlZCBpZiBJQ0UgaXMgZG9uZScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIHNob3VsZCBiZSBjYWxsZWUgKGFuc3dlcmluZylcbiAgICAgICAgICBtYWtlQW5zd2VyKGNvbm5lY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiaW5kSUNFQ2FuZGlkYXRlSGFuZGxlcnMoY29ubmVjdGlvbikge1xuICAgICAgY29ubmVjdGlvbi5vbmljZWNhbmRpZGF0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSB7XG4gICAgICAgICAgc2VuZElDRUNhbmRpZGF0ZShldmVudC5jYW5kaWRhdGUpOyAvLyB0cmlja2xlIElDRSBjYW5kaWRhdGVzXG4gICAgICAgICAgcHJpbnQoJ1NlbnQgYW4gSUNFIGNhbmRpZGF0ZScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHByaW50KCdGaW5pc2hlZCBzZW5kaW5nIElDRSBjYW5kaWRhdGVzJyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHNvY2tldC5vbigncmVtb3RlX0lDRV9jYW5kaWRhdGUnLCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25uZWN0aW9uLmFkZEljZUNhbmRpZGF0ZShkYXRhLmNhbmRpZGF0ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcHJpbnQoJ0FkZGVkIElDRSBjYW5kaWRhdGUnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbmRJQ0VDYW5kaWRhdGUoY2FuZGlkYXRlKSB7XG4gICAgICBzb2NrZXQuZW1pdCgnc2VuZF9JQ0VfY2FuZGlkYXRlJywge2NhbmRpZGF0ZTogY2FuZGlkYXRlfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNFbXB0eURlc2NyaXB0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICByZXR1cm4gIShkZXNjcmlwdGlvbi50eXBlICYmIGRlc2NyaXB0aW9uLnNkcCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnQoLi4uc3RyKSB7XG4gICAgICBjb25zb2xlLmxvZyguLi5zdHIpO1xuICAgIH1cblxuICAgIC8vIGNvbnNpZGVyIHVzaW5nIHJldmVhbGluZyBtb2R1bGUgcGF0dGVyblxuICAgIHJldHVybiBjaGFubmVsO1xuICB9O1xuXG4gIGxldCBjaGFubmVsID0gY3JlYXRlQ2hhbm5lbCgpO1xuXG4gIC8vIHVzZSBhIHRyYWRpdGlvbmFsIGNvbnN0cnVjdG9yIGZ1bmN0aW9uXG4gIC8vIHRvIHVzZSBzYW1lIHByb3RvdHlwZSBvYmplY3QsIHNhdmUgbWVtb3J5XG4gIHdpbmRvdy5DaGFubmVsID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgbGV0IG9iaiA9IE9iamVjdC5jcmVhdGUoY2hhbm5lbCk7XG4gICAgb2JqLmluaXQoY29uZmlnKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xufSgpKTtcbiJdfQ==
