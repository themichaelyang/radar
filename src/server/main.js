'use strict';

const fs = require('fs');
const process = require('process');

const OPTIONS = {
  key: fs.readFileSync(__dirname + '/keys/server.pem'),
  cert: fs.readFileSync(__dirname + '/keys/server.crt')
};
const CLIENT_DIR = '/src/client';
const PORT = 3000;

let previousRequestDate;

const server = require('https').createServer(OPTIONS);
server.on('request', (request, response) => {
  let url = CLIENT_DIR + (request.url === '/' ? '/index.html' : request.url);
  let currentDirectory = process.cwd();
  fs.readFile(currentDirectory + url, (error, data) => {
    if (error) {
      if (error.code === 'ENOENT') {
        response.writeHead(400);
        response.end("404: Couldn't find " + url);
      }
      else {
        response.writeHead(500);
        response.end('Error loading '+ url);
        console.error(error);
      }
    }
    else {
      response.writeHead(200);
      response.end(data);
    }
  });
  let date = (new Date()).toString();
  if (!previousRequestDate || previousRequestDate !== date) {
    console.log();
    console.log('[' + date + ']');
  }
  console.log(request.method + ': ' + request.url);
  previousRequestDate = date;
});

server.listen(PORT);
console.log('Listening on: ' + PORT);

// http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
require('dns').lookup(require('os').hostname(), (err, add, fam) => {
  console.log('http://' +add + ':' + PORT);
})
