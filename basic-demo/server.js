import http from "node:http";
import { WebSocketServer } from "ws";
import fs from "node:fs";
import path from "path";
import {redisPublish,redisSubscriber} from "./connection.js"
const PORT = process.env.PORT || 9000;
const CHANNEL="messages";
const httpServer = http.createServer(async function (req, res) {
  const indexFile = fs.readFile(
    path.resolve("./index.html"),
    "utf8",
    (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error occurred while reading index.html");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    },
  );
});
const ws = new WebSocketServer({ server: httpServer });

redisSubscriber.subscribe(CHANNEL);

redisSubscriber.on("message", (channel, message) => {
    if (channel === CHANNEL) {
        ws.clients.forEach((client) => {
            client.send(message);
        }); 
    }
});

ws.on("connection", (websocket) => {
  console.log("New WebSocket connection");

  websocket.on("message", (message) => {
    console.log(`Received message: ${message}`);
    redisPublish.publish(CHANNEL, message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
