import { ChatRoomMessageAction, Message } from "@models/Message";
import Participant from "@models/Participant";

export default class ChatRoom implements IRoom {
  readonly name: ChatRoomId;
  readonly participants: Set<Participant>;

  constructor(roomName: ChatRoomId, participants?: Set<Participant>) {
    this.name = roomName;
    this.participants = participants ? participants : new Set<Participant>();
  }

  dispose = () => this.participants.clear();

  join = (p: Participant) => {
    if (!this.participants.has(p)) {
      Log.debug(
        `Participant [id: ${p.id}, alias: ${p.alias}] has joined ${this.name}room.`
      );
      p.subscribedTo.add(this);
      this.participants.add(p);
      this.notifyRoomAboutParticipant(p, ChatRoomMessageAction.joinNotif);
      return true;
    }
    return false;
  };

  leave = (p: Participant) => {
    if (this.participants.has(p)) {
      Log.debug(
        `Participant [id: ${p.id}, alias: ${p.alias}] has left ${this.name} room.`
      );

      p.subscribedTo.delete(this);
      this.participants.delete(p);
      this.notifyRoomAboutParticipant(p, ChatRoomMessageAction.leaveNotif);
      return true;
    }
    return false;
  };

  message = (message: Message) => {
    this.broadcast(message);
  };

  notifyRoomAboutParticipant = (
    p: Participant,
    action: ChatRoomMessageAction.joinNotif | ChatRoomMessageAction.leaveNotif
  ): void => {
    this.broadcast({
      topic: "chat",
      action: action,
      room: this.name,
      from: p.id,
      ts: new Date().toISOString(),
    });
  };

  broadcast = (message: Message) => {
    for (const participant of this.participants) {
      participant.send(message);
    }
  };
}

interface IRoom {
  join: (p: Participant) => boolean;
  leave: (p: Participant) => boolean;
  message: (message: Message) => void;
  dispose: () => void;
}

export type ChatRoomId = string;
