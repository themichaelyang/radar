function startVideo() {
  navigator.mediaDevices.getUserMedia(config.constraints)
  .then(() => {});
}
