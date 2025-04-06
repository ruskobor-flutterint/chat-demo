export interface IMessage {
  topic: MessageTopics;
  action: MessageActions;
  data: Object;
}

export interface IMessage {
  topic: MessageTopics;
  action: MessageActions;
  data: Object;
}

export enum MessageActions {
  subscribe,
  unsubscribe,
}

export enum MessageTopics {
  system,
  chat,
}

//-----------------------------------------------------
export type Message = ISystemMessage | IChatMessage;

enum SystemMessageActions {
  subscribe,
  unsubscribe,
}

enum ChatMessageAction {
  post,
}

interface ISystemMessage extends BaseMessage {
  topic: "system";
  action: SystemMessageActions;
  participant: string;
  room: string;
}

interface IChatMessage extends BaseMessage {
  topic: "chat";
  action: ChatMessageAction;
  author: string;
  timestamp: string | Date;
  room: string;
}

// For any additional quick data additions
type BaseMessage = { customData?: Object };
