import { ChatClientWebSocket } from "../main";

export default class Participant {
  name: ParticipantId;
  ws: ChatClientWebSocket;
  constructor(ws: ChatClientWebSocket) {
    this.name = ws.clientId;
    this.ws = ws;
  }
}

export type ParticipantId = string | number;
