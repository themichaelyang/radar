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
    console.log("%cRTCDataChannel now open and ready to receive messages", "color:blue;");
    dataChannel.send("hello!");
  }
  dataChannel.onmessage = (event) => { // careful: both clients recieve message sent
    let message = event.data;
    console.log("RTCDataChannel recieved a message: "+message);
  }
  dataChannel.onclose = () => {
    console.log("RTCDataChannel closed");
  }
  dataChannel.onerror = () => {
    console.log("RTCDataChannel error!");
  }
}
