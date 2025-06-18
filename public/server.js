const express = require("express");
const WebSocket = require("ws");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;
const upload = multer({ dest: path.join(__dirname, "media") });

app.use(express.static(__dirname));

app.post("/upload", upload.array("files"), (req, res) => {
  const renamedFiles = [];
  req.files.forEach(file => {
    const dest = path.join(__dirname, "media", file.originalname);
    fs.renameSync(file.path, dest);
    renamedFiles.push("media/" + file.originalname);
  });
  res.json({ files: renamedFiles });
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
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

app.get("/media-list", (req, res) => {
  const mediaPath = path.join(__dirname, "media");
  fs.readdir(mediaPath, (err, files) => {
    if (err) return res.status(500).json({ error: "Unable to list files" });
    res.json(files.filter(f => /\.(jpe?g|png|gif|mp4|webm)$/i.test(f)));
  });
});
