window.addEventListener('load', (event) => {
  let location = window.location;
  let isCordova = !!window.cordova;
  let isHTTPS = location.protocol === 'https:'
                || location.hostname === 'localhost'
                || location.hostname === '127.0.0.1'
                || isCordova;
  if (!isHTTPS) {
    window.location = 'https:' + location.href.substring(6);
  }
});
