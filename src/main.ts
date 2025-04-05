import { WebSocket, ServerOptions, WebSocketServer } from "ws";
import { IncomingMessage } from "node:http";
import ChatRoom from "./service/ChatRoom";
import Log from "./util/Log";

// WS server setup
const wssOptions: ServerOptions = { port: 3030 };
const wsServer: WebSocketServer = new WebSocketServer(wssOptions);

Log.info("Starting wsServer on port", wssOptions.port);

// OPEN Event
wsServer.on("connection", (ws: ChatClientWebSocket, req: IncomingMessage) => {
  //   Log.debug(parse(req.url, true));

  ws.clientId = "client-" + Math.floor(Math.random() * 100).toString();
  ws.send("Hello , " + ws.clientId);
  // Log.info(`WS connected`, ws);
  //   Log.info("Clients", wsServer.clients);

  // MESSAGE Event
  ws.on("message", (data: unknown) => {
    Log.info("message", JSON.parse(data as string));

    // 1 Chat Message
    // 2 Subscirbe to

    // Based on messages he will subscribe/unsubscribe from different general/private rooms
    // Single user will result in single ws connection to the server
    // API endpoint will retrieve all public rooms, private will not be available
    // Status for disconnects will be displayed in all rooms concerned
    // Messages will be used to display all currently used systems for all available/connect

    /**
     * System Topic messages,
     *
     * type Message = {topic: Room.name, data: string, author: string, timestamp: string }
     * type Message = {topic: System, action:"UserConnected" user: string}
     * type Message = {topic: System, action:"UserDisconnected" user: string}
     *
     * onConnection ->
     *  1. System - User connected/disconnected - SystemBroadcaster.
     *
     * onMessage ->
     *  1. System   -> System notifications         -> SystemBroadcaster(clients)
     *  2. Chat     -> Distribute to other rooms    -> ChatBroadcaster(clients)
     *
     * onError/onClose ->
     * 1. Unsubscribe user from all queues
     */

    const message: IMessage = JSON.parse(data as string);

    switch (message.topic) {
      case "Chat":
        break;
      case "System":
        break;
      default:
        Log.error("Unrecognized message", message);
    }

    // chatBroadcaster.write(message)

    ws.send(ws.clientId);
  });

  // CLOSE event
  ws.on("close", () => {
    Log.info(`${ws.clientId} has closed connection.`);
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
