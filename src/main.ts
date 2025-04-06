import { WebSocket, ServerOptions, WebSocketServer } from "ws";
import { IncomingMessage } from "node:http";
import ChatRoom from "./service/ChatRoom";
import Log from "./util/Log";
import LobbyManager from "./service/LobbyManager";

// ENV
const WSS_PORT = 3030;

// WS server setup
const wssOptions: ServerOptions = { port: WSS_PORT };
Log.info("Starting wsServer on port", wssOptions.port);
const wsServer: WebSocketServer = new WebSocketServer(wssOptions);

const lobbyManager = new LobbyManager();

// General user handling
wsServer.on("connection", (ws: ChatClientWebSocket, req: IncomingMessage) => {
  //   Log.debug(parse(req.url, true));

  ws.clientId = "client-" + Math.floor(Math.random() * 100).toString();
  ws.send("Hello , " + ws.clientId);

  ws.on("close", () => {
    lobbyManager.emit("user_disconnected", {});
  });
});

export interface IMessage {
  topic: "System" | "Chat";
  action: "subscribe" | "unsubscribe";
  data: string;
  origin: string;
}

export interface ChatClientWebSocket extends WebSocket {
  clientId: string;
  subscribedTo: ChatRoom[];
}
