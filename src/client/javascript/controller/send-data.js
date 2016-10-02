function sendData(channel) {
  window.setInterval(() => {
    channel.send('hello');
    console.log('sent');
  }, 100);

}
