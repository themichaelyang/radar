function awaitDataChannel(connection) {
  return new Promise((resolve, reject) => {
    connection.ondatachannel = (event) => {
      let dataChannel = event.channel;
      resolve(dataChannel);
    }
  });
}

// later differentiate between caller and receiver
function bindDataChannelHandlers(dataChannel) {
  dataChannel.onopen = () => {
    console.log("%cRTCDataChannel now open and ready to receive messages", "color:red;");
    dataChannel.send("hello!");
  }
  dataChannel.onmessage = (event) => {
    let message = event.data;
    console.error("RTCDataChannel recieved a message: "+message);
  }
  dataChannel.onclose = () => {
    console.error("RTCDataChannel closed");
  }
  dataChannel.onerror = () => {
    console.error("RTCDataChannel error!");
  }
}
