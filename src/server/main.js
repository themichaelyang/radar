'use strict';

const fs = require('fs');
const process = require('process');

const OPTIONS = {
  key: fs.readFileSync(__dirname + '/keys/server.pem'),
  cert: fs.readFileSync(__dirname + '/keys/server.crt')
};
const CLIENT_DIR = '/src/client';
const PORT = 3000;

let server = require('./server.js')(CLIENT_DIR, OPTIONS);

server.listen(PORT);
console.log('Listening on: ' + PORT);
// http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
require('dns').lookup(require('os').hostname(), (err, add, fam) => {
  console.log('http://' +add + ':' + PORT);
})
