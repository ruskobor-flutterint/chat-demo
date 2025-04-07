import { ChatRoomMessageAction, IChatRoomMessage } from "@models/Message";
import Participant, { ParticipantId } from "@models/Participant";

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
        `Participant {id: ${p.id}, alias: ${p.alias}} has joined ${this.name}room.`
      );
      p.subscribedTo.add(this);
      this.participants.add(p);
      this.notifyParticapantHeEntered(p);
      this.notifyRoomAboutParticipant(p, ChatRoomMessageAction.joinNotifFanout);
      return true;
    }
    return false;
  };

  leave = (p: Participant) => {
    if (this.participants.has(p)) {
      Log.debug(
        `Participant {id: ${p.id}, alias: ${p.alias}} has left ${this.name} room.`
      );

      p.subscribedTo.delete(this);
      this.participants.delete(p);
      this.notifyRoomAboutParticipant(
        p,
        ChatRoomMessageAction.leaveNotifFanout
      );
      return true;
    }
    return false;
  };

  notifyRoomAboutParticipant = (
    p: Participant,
    action:
      | ChatRoomMessageAction.joinNotifFanout
      | ChatRoomMessageAction.leaveNotifFanout
  ): void => {
    this.broadcast({
      topic: "chat",
      action: action,
      room: this.name,
      from: p.id,
      customData: {
        participantInfo: { id: p.id, alias: p.alias },
        chatMessage:
          action === ChatRoomMessageAction.joinNotifFanout
            ? `User ${p.alias}/${p.id} has entered the room.`
            : `User ${p.alias}/${p.id} has left the room.`,
      },
      ts: new Date().toISOString(),
    });
  };

  notifyParticapantHeEntered(p: Participant) {
    const roomParticipants: { id: ParticipantId; alias: ParticipantId }[] = [
      ...this.participants,
    ].map((p: Participant) => ({ id: p.id, alias: p.alias }));

    const message: IChatRoomMessage = {
      topic: "chat",
      action: ChatRoomMessageAction.joined,
      room: this.name,
      from: p.id,
      ts: new Date().toISOString(),
      customData: { roomParticipants: roomParticipants },
    };

    p.send(message);
  }

  message(m: IChatRoomMessage) {
    // Check if participant can send messsages to the following room
    if (![...this.participants].find((p: Participant) => m.from === p.id)) {
      Log.warn(`User ${m.from} cannot message room ${m.room}`);
      return;
    }

    m.action = ChatRoomMessageAction.postFanout;
    m.ts = new Date().toISOString();
    this.broadcast(m);
  }

  broadcast = (message: IChatRoomMessage) => {
    for (const participant of this.participants) {
      participant.send(message);
    }
  };
}

interface IRoom {
  join: (p: Participant) => boolean;
  leave: (p: Participant) => boolean;
  broadcast: (message: IChatRoomMessage) => void;
  dispose: () => void;
}

export type ChatRoomId = string;
