function sendData(channel) {
  window.setInterval(() => {
    channel.send(new Date().toString());
    console.log('sent');
  }, 100);

}
