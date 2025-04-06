import ChatRoom from "@service/ChatRoom";
import { ChatClientWebSocket } from "@util/ChatClientWebSocket";

export default class Participant {
  name: ParticipantId;
  ws: ChatClientWebSocket;

  getRooms = (): ChatRoom[] => this.ws.subscribedTo;

  constructor(ws: ChatClientWebSocket) {
    this.name = ws.clientId;
    this.ws = ws;
  }
}

export type ParticipantId = string | number;
