import Log from "@util/Log";
import LobbyManager from "@service/LobbyManager";
import ChatRoom from "@service/models/ChatRoom";
import Participant from "@models/Participant";
import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "node:http";
import { Message } from "@service/models/Message";
import * as url from "url";

// ENV
const WSS_PORT = 3030;

// WS server setup
Log.info("Starting wsServer on port", WSS_PORT);
const wsServer: WebSocketServer = new WebSocketServer({ port: WSS_PORT }).on(
  "error",
  (err) => {
    Log.error("Server error: ", err);
  }
);

// LobbyManagerService setup
const lobbyManager = new LobbyManager();

// Default rooms setup
const generalChatRoom = new ChatRoom("General");
const anouncementChatRoom = new ChatRoom("Announcements");
const memesChatRoom = new ChatRoom("Memes");

lobbyManager.addRoom(generalChatRoom, anouncementChatRoom, memesChatRoom);

// General user handling
wsServer.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const params: { alias?: Record<string, string | string[]> } = url.parse(
    req.url as string,
    true
  ).query;

  const clientId = "client-" + Math.floor(Math.random() * 1000).toString();
  let clientAlias: string = "";

  // If client alias is provided rewrite the alias
  if (params?.alias && typeof params?.alias == "string")
    clientAlias = params.alias;

  const p = new Participant(ws, clientId, clientAlias);

  lobbyManager.emit("participant_connect", p);

  ws.send(JSON.stringify({ Hi: { id: clientId, alias: clientAlias } }));

  ws.on("message", (data) => {
    try {
      const m: Message = JSON.parse(data.toString());
      lobbyManager.emit("participant_message", m, p);
    } catch (error) {
      Log.error(`Error parsing data from message ${data} error:`, error);
    }
  });

  ws.on("close", () => {
    lobbyManager.emit("participant_disconnect", p);
  });
});

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  Log.error("Uncaught exception caught: ", err);
});
