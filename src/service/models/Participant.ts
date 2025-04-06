import ChatRoom from "@service/models/ChatRoom";
import { Message } from "@models/Message";
import Log from "@util/Log";
import { WebSocket } from "ws";

export default class Participant<T extends WebSocket = WebSocket> {
  private readonly ws: T;
  readonly name: ParticipantId;
  readonly subscribedTo: Set<ChatRoom>;

  constructor(ws: T, clientId: ParticipantId) {
    this.name = clientId;
    this.ws = ws;
    this.subscribedTo = new Set<ChatRoom>();
  }

  dispose = () => {
    this.subscribedTo.clear();
    this.ws.close();
  };

  send = (m: Message) => {
    if (this.ws.OPEN) {
      try {
        this.ws.send(JSON.stringify(m));
      } catch (error) {
        Log.error(`Error serializing message ${m}} erro:`, error);
      }
    }
  };
}

export type ParticipantId = string | number;
