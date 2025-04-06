import { EventEmitter } from "stream";
import ChatRoom, { ChatRoomId } from "@service/models/ChatRoom";
import Participant from "@models/Participant";
import {
  ChatMessageAction,
  Message,
  SystemMessageActions,
} from "@models/Message";
import Log from "@util/Log";

export default class LobbyManager extends EventEmitter {
  rooms: Map<ChatRoomId, ChatRoom>;
  guests: Set<Participant>;

  constructor() {
    super();
    this.rooms = new Map<ChatRoomId, ChatRoom>();
    this.guests = new Set<Participant>();

    this.on("participant_connect", (p: Participant) => this.registerGuest(p));
    this.on("participant_close_connection", (p: Participant) =>
      this.disconnectGuest(p)
    );
    this.on("participant_message", (m: Message, p: Participant) => {
      if (m.topic == "system") {
        switch (m.action) {
          case SystemMessageActions.subscribe:
            this.rooms.get(m.room)?.join(p);
            break;
          case SystemMessageActions.unsubscribe:
            this.rooms.get(m.room)?.leave(p);
            break;

          default:
            Log.warn(`Unregonized SystemMessageAction: ${m}`);
        }
      }

      if (m.topic == "chat") {
        switch (m.action) {
          case ChatMessageAction.post:
            this.rooms.get(m.room)?.broadcast(m);
            break;
          default:
            Log.warn(
              `Unregonized SystemMessageAction: message: ${JSON.stringify(m)}`
            );
        }
      }
    });
  }

  registerGuest = (p: Participant) => {
    this.guests.add(p);
    Log.info(`Participant ${p.name} registered to the lobby.`);
  };

  disconnectGuest = (p: Participant) => {
    if (this.guests.has(p)) {
      for (const room of p.subscribedTo) room.leave(p);
      this.guests.delete(p);
      p.dispose();

      Log.info(`Participant ${p.name} has disconnected the lobby.`);
    }
  };

  addRoom = (...rAgs: ChatRoom[]) => {
    for (const room of rAgs) {
      this.rooms.set(room.name, room);
      Log.debug(
        `Added ${room.name}[${
          room.isPublic() ? "PUBLIC" : "PRIVATE"
        }] room to Lobby`
      );
    }
  };

  disposeRoom = (r: ChatRoom) => {
    this.rooms.delete(r.name);
    r.dispose();

    Log.debug(`Disposing ${r.name} room.`);
  };
}
