function main() {
  if (navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      // count cameras to determine device
      let cameras = devices.filter((mediaDevice) => {
        return mediaDevice.kind === 'videoinput';
      });

      if (cameras.length >= 2) {
        document.body.innerHTML += '<p>probably a phone/tablet</p>';
        // keep in mind that new computers are like weird mixes of both
      }
      else {
        document.body.innerHTML += '<p>probably a computer</p>';
      }
    });
  }
}

window.onload = main;
