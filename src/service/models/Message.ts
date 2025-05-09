import { ChatRoomId } from "@service/models/ChatRoom";
import { ParticipantId } from "./Participant";

export type Message = ISystemMessage | IChatRoomMessage | IDirectMessage;

export enum SystemMessageAction {
  subscribe,
  unsubscribe,
  lobby,
  leftLobby,
  joinedLobby,
}

export enum ChatRoomMessageAction {
  post,
  joinNotifFanout,
  leaveNotifFanout,
  postFanout,
  joined,
  left,
}

export enum DirectMessageAction {
  post,
  recieve,
}

export interface IDirectMessage extends BaseMessage {
  topic: "direct";
  action: DirectMessageAction;
  from: ParticipantId;
  to: ParticipantId;
}

export interface ISystemMessage extends BaseMessage {
  topic: "system";
  action: SystemMessageAction;
  participant: ParticipantId;
  room: ChatRoomId;
}

export interface IChatRoomMessage extends BaseMessage {
  topic: "chat";
  action: ChatRoomMessageAction;
  room: ChatRoomId;
  from: ParticipantId;
  ts: string | Date;
}

// For any additional quick data additions
type BaseMessage = { customData?: Object };
