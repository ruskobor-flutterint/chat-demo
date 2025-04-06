import Log from "@util/Log";
import LobbyManager from "@service/LobbyManager";
import ChatRoom from "@service/ChatRoom";
import Participant from "@models/Participant";
import { ChatClientWebSocket } from "@util/ChatClientWebSocket";
import { WebSocketServer } from "ws";
import { IncomingMessage } from "node:http";

// ENV
const WSS_PORT = 3030;

// WS server setup
Log.info("Starting wsServer on port", WSS_PORT);
const wsServer: WebSocketServer = new WebSocketServer({ port: WSS_PORT });

const lobbyManager = new LobbyManager();
const generalChatRoom: ChatRoom = new ChatRoom("General");

// General user handling
wsServer.on("connection", (ws: ChatClientWebSocket, req: IncomingMessage) => {
  //   Log.debug(parse(req.url, true));
  ws.clientId = "client-" + Math.floor(Math.random() * 100).toString();

  // const p = new Participant(ws);
  // generalChatRoom.subscribe(p);

  ws.send("Hello , " + ws.clientId);
  ws.on("close", () => {
    lobbyManager.emit("user_disconnected");
  });
});
