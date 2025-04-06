import { ChatRoomId } from "@service/models/ChatRoom";
import { ParticipantId } from "./Participant";

export type Message = ISystemMessage | IChatMessage;

export enum SystemMessageActions {
  subscribe,
  unsubscribe,
  create,
}

export enum ChatMessageAction {
  post,
  join,
  leave,
}

interface ISystemMessage extends BaseMessage {
  topic: "system";
  action: SystemMessageActions;

  participant: ParticipantId;
  room: ChatRoomId;
}

interface IChatMessage extends BaseMessage {
  topic: "chat";
  action: ChatMessageAction;
  participant: ParticipantId;
  ts: string | Date;
  room: ChatRoomId;
}

// For any additional quick data additions
type BaseMessage = { customData?: Object };
