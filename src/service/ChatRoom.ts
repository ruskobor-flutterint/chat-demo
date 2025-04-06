import { IMessage } from "./models/Message";
import Participant from "./models/Participant";

import { EventEmitter } from "node:stream";

export default class ChatRoom extends EventEmitter {
  private name: string;
  private participants: Set<Participant>;

  constructor(roomName: string, participants?: Set<Participant>) {
    super();
    this.name = roomName;
    this.participants = participants ? participants : new Set<Participant>();

    this.on("user_subscribed", () => {});

    this.on("user_unsubscribed", (p: Participant) => {
      this.participants.delete(p);
    });

    this.on("user_subscribed", () => {});

    this.on("user_disconnected", () => {});
  }

  subscribe = (participant: Participant): void => {
    Log?.debug(`Participant ${participant.name} has joined ${this.name} romm.`);

    // Setup up WS listenres
    participant.ws.on("message", (data) => {
      this.emit<IMessage>("user_subscribed", {});
    });

    participant.ws.on("close", (data) => {
      // this.disconnectParticipant(p);
    });

    participant.ws.on("pong", (data) => {
      this.emit<IMessage>("pong", {});
    });

    this.participants.add(participant);
  };

  unsubscribe = (p: Participant) => {
    Log?.debug(`Participant ${p.name} has left ${this.name} romm.`);

    this.participants.delete(p);
    this.emit("user_unsubscribed", {});
  };

  disconnectParticipant = (p: Participant) => {
    if (this.participants.has(p)) {
      this.emit("user_unsubscribed");
      let msg: Partial<IMessage> = {};
      this.broadcast(msg);
    }
  };

  broadcast = (message: Partial<IMessage>) => {
    for (const participant of this.participants) {
      participant.ws.send(JSON.stringify(message));
    }
  };
}
