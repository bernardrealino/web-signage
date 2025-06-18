const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", ws => {
  clients.push(ws);
  ws.on("close", () => {
    clients = clients.filter(client => client !== ws);
  });
  ws.on("message", message => {
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});