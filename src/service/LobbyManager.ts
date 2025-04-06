import { EventEmitter } from "stream";
import ChatRoom from "./ChatRoom";
import Participant from "./models/Participant";

export default class LobbyManager extends EventEmitter {
  rooms: Set<ChatRoom>;

  constructor(
    chatRooms: ChatRoom[] = [
      new ChatRoom("General"),
      new ChatRoom("News"),
      new ChatRoom("Q&A"),
    ]
  ) {
    super();
    this.rooms = new Set<ChatRoom>();
    chatRooms.forEach((r: ChatRoom) => {
      this.rooms.add(r);
      this.setRoomListeners(r);
    });

    this.on("user_disconnected", (p: Participant) => {
      for (const room of p.ws.subscribedTo)
        room.emit("user_unsubscribed", () => {});
    });
  }

  setRoomListeners(r: ChatRoom) {
    r.on("user_subscribed", () => {});
    r.on("user_unsubscribed", () => {});
    r.on("user_disconnected", () => {
      this.emit("user_disconnected");
    });
  }

  createRoom = (r: ChatRoom) => {
    this.rooms.add(r);
  };

  disposeRoom = (r: ChatRoom) => {
    this.rooms.delete(r);
  };

  addUserToLobby = (p: Participant) => {
    p.ws.on("message", () => {});
  };
}
