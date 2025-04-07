import { EventEmitter } from "stream";
import ChatRoom, { ChatRoomId } from "@service/models/ChatRoom";
import Participant, { ParticipantId } from "@models/Participant";
import {
  ChatRoomMessageAction,
  DirectMessageAction,
  IChatRoomMessage,
  IDirectMessage,
  ISystemMessage,
  Message,
  SystemMessageAction,
} from "@models/Message";
import Log from "@util/Log";

export default class LobbyManager extends EventEmitter {
  readonly rooms: Map<ChatRoomId, ChatRoom>;
  readonly guests: Map<ParticipantId, Participant>;

  constructor() {
    super();
    this.rooms = new Map<ChatRoomId, ChatRoom>();
    this.guests = new Map<ParticipantId, Participant>();

    this.on("participant_connect", (p: Participant) => this.registerGuest(p));
    this.on("participant_disconnect", (p: Participant) =>
      this.disconnectGuest(p)
    );
    this.on("participant_message", (m: Message, p: Participant) => {
      try {
        if (m.topic == "system") this.handleSystemMessage(m);
        else if (m.topic == "chat") this.handleChatRoomMessage(m);
        else if (m.topic == "direct") this.handleDirectMessage(m);
        else
          Log.debug(`Unregonnized message topic: message`, JSON.stringify(m));
      } catch (err) {
        p.sendError(err as Error);
      }
    });
    this.on("system_message", (m: ISystemMessage) => {});
  }

  private registerGuest = (p: Participant) => {
    this.guests.set(p.id, p);
    Log.info(
      `Participant [id: ${p.id}, alias: ${p.alias}] registered to the lobby.`
    );

    // Get all rooms
    const rooms = [...this.rooms.keys()];
    // Get all guests ids,alias
    const guests: { id: string; alias: string }[] = [];
    this.guests.forEach((p: Participant) => {
      guests.push({ id: p.id, alias: p.alias });
    });

    const msg: ISystemMessage = {
      topic: "system",
      action: SystemMessageAction.lobby,
      participant: p.alias,
      room: "",
      customData: { rooms: rooms, guests: guests },
    };

    // Send all available rooms & users
    p.send(msg);
  };

  private disconnectGuest = (p: Participant) => {
    if (this.guests.has(p.id)) {
      this.guests.delete(p.id);
      p.dispose();
      Log.info(
        `Participant [id: ${p.id}, alias: ${p.alias}] has disconnected the lobby.`
      );
    }
  };

  readonly addRoom = (...rAgs: ChatRoom[]) => {
    for (const room of rAgs) {
      this.rooms.set(room.name, room);
      Log.debug(`Added ${room.name} room to Lobby`);
    }
  };

  private handleSystemMessage = (m: ISystemMessage) => {
    const p: Participant | undefined = this.guests.get(m.participant);

    if (p === undefined) throw `Participant ${m.participant} unrecognzied`;

    switch (m.action) {
      case SystemMessageAction.subscribe:
        this.rooms.get(m.room)?.join(p);
        break;
      case SystemMessageAction.unsubscribe:
        this.rooms.get(m.room)?.leave(p);
        break;
      default:
        Log.warn(`Unregonized SystemMessageAction: ${m}`);
    }
  };

  private handleChatRoomMessage = (m: IChatRoomMessage) => {
    switch (m.action) {
      case ChatRoomMessageAction.post:
        this.rooms.get(m.room)?.broadcast(m);
        break;
      default:
        Log.warn(
          `Unregonized SystemMessageAction, message: ${JSON.stringify(m)}`
        );
    }
  };

  private handleDirectMessage = (m: IDirectMessage) => {
    switch (m.action) {
      case DirectMessageAction.post:
        this.sendDirectMessage(m.from, m.to, m);
        // this.sendDirectMessage(m.from,m.to)

        break;
      default:
        Log.warn(
          `Unregonized DirectMessageAction, message: ${JSON.stringify(m)}`
        );
    }
  };

  private sendDirectMessage = (
    fromP: ParticipantId,
    toP: ParticipantId,
    m: IDirectMessage
  ) => {
    const p1: Participant | undefined = this.guests.get(fromP);
    const p2: Participant | undefined = this.guests.get(toP);

    if (p1 === undefined || p2 === undefined)
      throw `Unavailable participant/s [ ${p1?.id} / ${p2?.id} ]-[ ${fromP}/${toP} ]`;

    p2.send(m);
  };
}
