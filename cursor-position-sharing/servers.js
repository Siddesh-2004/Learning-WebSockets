import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map();

let id = 1;
wss.on("connection", (ws) => {
  console.log("client connected");
  const color = Math.floor(Math.random() * 360);
  const metadata = { id, color };
  id++;
  clients.set(ws, metadata);
  // console.log(ws);
  ws.on("message", (messageAsString) => {
    console.log("RawString:" + messageAsString);
    const message = JSON.parse(messageAsString);
    const metadata = clients.get(ws);
    message.sender = metadata.id;
    message.color = metadata.color;
    const outbound = JSON.stringify(message);
    [...clients.keys()].forEach((client) => {
      client.send(outbound);
    });
  });
  ws.on("close", () => {
    clients.delete(ws);
  });
});
