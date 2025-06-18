
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });
let connections = [];

wss.on('connection', function connection(ws) {
  connections.push(ws);
  ws.on('message', function incoming(message) {
    connections.forEach(conn => conn.send(message));
  });
  ws.on('close', () => {
    connections = connections.filter(conn => conn !== ws);
  });
});
