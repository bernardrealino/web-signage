const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const mediaDir = path.join(__dirname, "media");
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

app.use("/media", express.static(mediaDir));
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mediaDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post("/upload", upload.array("files"), (req, res) => {
  res.sendStatus(200);
});

app.get("/media-list", (req, res) => {
  fs.readdir(mediaDir, (err, files) => {
    if (err) return res.status(500).json([]);
    res.json(files.filter(f => /\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i.test(f)));
  });
});

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
