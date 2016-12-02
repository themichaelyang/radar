function main() {
  if (navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      let clientInfoElement = document.getElementById('client-info');

      // count cameras to determine device
      let cameras = devices.filter((mediaDevice) => {
        return mediaDevice.kind === 'videoinput';
      });

      if (cameras.length >= 2) {
        clientInfoElement.innerHTML += '<p>probably a phone/tablet</p>';
        // keep in mind that new computers are like weird mixes of both
      }
      else {
        clientInfoElement.innerHTML += '<p>probably a computer</p>';
      }
    });
  }
}

window.onload = main;
