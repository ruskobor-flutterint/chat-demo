// import Stream from "node:stream";
import Participant, { ParticipantId } from "./Participant";
import { IMessage } from "../main";

export default class ChatRoom {
  private name: string;
  private participants: Set<Participant>;

  constructor(roomName: string, participants?: Set<Participant>) {
    this.name = roomName;
    this.participants = participants ? participants : new Set<Participant>();
  }

  subscribe = (participant: Participant): void => {
    this.participants.add(participant);
  };

  unsubscribe = (participant: Participant) => {
    this.participants.delete(participant);
  };

  fanout = (message: IMessage) => {
    for (const participant of this.participants) {
      participant.ws.send(JSON.stringify(message));
    }
  };

  publish = (): void => {};
}
