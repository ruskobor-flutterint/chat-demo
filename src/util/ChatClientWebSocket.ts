import { WebSocket } from "ws";

export interface ChatClientWebSocket extends WebSocket {
  clientId: string;
}
