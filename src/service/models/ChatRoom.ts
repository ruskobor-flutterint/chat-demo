import { ChatMessageAction, Message } from "@models/Message";
import Participant from "@models/Participant";

export default class ChatRoom implements IRoom {
  readonly name: ChatRoomId;
  readonly participants: Set<Participant>;
  private _isPublic: boolean;

  constructor(
    roomName: ChatRoomId,
    participants?: Set<Participant>,
    isPublic?: boolean
  ) {
    this.name = roomName;
    this.participants = participants ? participants : new Set<Participant>();
    this._isPublic = isPublic ? true : false;
  }

  dispose = () => this.participants.clear();

  join = (p: Participant) => {
    if (!this.participants.has(p)) {
      Log.debug(
        `Participant ${p.name} has joined ${this.name}-${
          this._isPublic ? "public" : "private"
        } room.`
      );

      p.subscribedTo.add(this);
      this.participants.add(p);
      this.notifyRoomAboutParticipant(p, "join");
      return true;
    }
    return false;
  };

  leave = (p: Participant) => {
    if (this.participants.has(p)) {
      Log.debug(
        `Participant ${p.name} has left ${this.name}-${this._isPublic} room.`
      );

      p.subscribedTo.delete(this);
      this.participants.delete(p);
      this.notifyRoomAboutParticipant(p, "leave");
      return true;
    }
    return false;
  };

  message = (message: Message) => {
    this.broadcast(message);
  };

  notifyRoomAboutParticipant = (
    p: Participant,
    action: "join" | "leave"
  ): void => {
    const m: Message = {
      topic: "chat",
      action: ChatMessageAction.join,
      room: this.name,
      participant: p.name,
      ts: new Date().toISOString(),
    };

    switch (action) {
      case "join":
        m.action = ChatMessageAction.join;
        break;
      case "leave":
        m.action = ChatMessageAction.leave;
        break;
    }

    this.broadcast(m);
  };

  isPublic = (): boolean => this._isPublic;

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
