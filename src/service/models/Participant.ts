import ChatRoom from "@service/models/ChatRoom";
import { Message } from "@models/Message";
import Log from "@util/Log";
import { WebSocket } from "ws";

export default class Participant<T extends WebSocket = WebSocket> {
  private readonly ws: T;
  readonly id: ParticipantId;
  readonly alias: string;
  readonly subscribedTo: Set<ChatRoom>;

  constructor(ws: T, clientId: ParticipantId, alias?: string) {
    this.id = clientId;
    this.ws = ws;
    this.alias = alias ? alias : clientId;
    this.subscribedTo = new Set<ChatRoom>();
  }

  dispose = () => {
    for (const room of this.subscribedTo) room.leave(this);
    this.subscribedTo.clear(); // Should be empty by now, but still
    this.ws.close();
  };

  sendError = (err: Error) => {
    Log.error(`Particapant ${this.id} ${this.alias} , error: `, err);
    if (this.ws.OPEN) {
      this.ws.send(JSON.stringify({ error: err.message ? err.message : err }));
    }
  };

  send = (m: Message) => {
    if (this.ws.OPEN) {
      try {
        const mStr = JSON.stringify(m);
        this.ws.send(mStr);
        Log.debug(
          `Message sent to {id: ${this.id}, alias: ${this.alias}} message: ${mStr}`
        );
      } catch (error) {
        Log.error(`Error serializing message ${m}} erro:`, error);
      }
    }
  };
}

export type ParticipantId = string;
