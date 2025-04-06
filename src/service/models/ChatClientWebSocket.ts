import ChatRoom from "service/ChatRoom";
import { WebSocket } from "ws";

export interface ChatClientWebSocket extends WebSocket {
  clientId: string;
  subscribedTo: ChatRoom[];
}
