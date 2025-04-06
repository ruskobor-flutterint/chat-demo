import { EventEmitter } from "node:events";
import { IMessage } from "@models/Message";
import Participant from "@models/Participant";

export default class ChatRoom extends EventEmitter {
  private name: string;
  private participants: Set<Participant>;
  private isPublic: boolean;

  constructor(
    roomName: string,
    participants?: Set<Participant>,
    isPublic?: boolean
  ) {
    super();
    this.name = roomName;
    this.participants = participants ? participants : new Set<Participant>();
    this.isPublic = isPublic ? true : false;

    this.on("user_subscribed", () => {});

    this.on("user_unsubscribed", (p: Participant) => {
      this.participants.delete(p);
    });

    this.on("user_subscribed", () => {});

    this.on("user_disconnected", () => {});
  }

  getPublicStatus = (): boolean => this.isPublic;

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
