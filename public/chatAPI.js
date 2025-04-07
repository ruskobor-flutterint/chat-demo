console.log("Loading ChatAPI.js");

function connectToWsChatService() {
  ws = new WebSocket(WS_SERVER_URL);

  ws.onopen = (event) => {
    console.log("WS opened");
    document.getElementById("wsConnectedStatus").innerText = "WS connected";
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Recieved message: ", message);

      // temp
      if (message.Hi) {
        meID = message.Hi;
        return;
      }

      if (message.topic == MessageTopics.System) {
        handleSystemMessages(message);
      }

      if (message.topic == MessageTopics.Direct) {
        handleDirectMessages(message);
      }
      if (message.topic == MessageTopics.ChatRoom) {
        handleChatMessages(message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  ws.onclose = (event) => {
    console.log("WS closed");
    console.log(event);
    document.getElementById("wsConnectedStatus").innerText = "WS disconnected";
  };

  ws.onerror = (event) => {
    console.log(event);
  };
}

function closeWs() {
  ws.close();
}

const MessageTopics = {
  System: "system",
  Direct: "direct",
  ChatRoom: "chat",
};

const SystemMessageAction = {
  subscribe: 0,
  unsubscribe: 1,
  lobby: 2,
};

const ChatRoomMessageAction = {
  post: 0,
  joinNotif: 1,
  leaveNotif: 2,
};

const DirectMessageAction = {
  post: 0,
  offline: 1,
  leaveNotif: 2,
};

function handleSystemMessages(message) {
  if (message.action == SystemMessageAction.lobby) {
    createLobbyRoomsAndGuests(
      message.customData.rooms,
      message.customData.guests
    );
  }
}

//
function createLobbyRoomsAndGuests(rooms, guests) {
  let roomsSelection = document.getElementById("lobby_rooms");

  rooms.forEach((room) => {
    let roomHtml = document.createElement("button");
    roomHtml.textContent = room + "";
    roomHtml.addEventListener("click", () => subscribeToRoomAPI(room + ""));
    roomHtml.id = room + "";
    roomsSelection.appendChild(roomHtml);
  });

  let guestsSelection = document.getElementById("lobby_guests");

  guests.forEach((guest) => {
    let guestHtml = document.createElement("button");

    guestHtml.textContent = guest.alias + "";
    guestHtml.addEventListener("click", () =>
      directMessageToAPI(guest.id + "")
    );
    guestHtml.id = "" + guest.id;
    guestsSelection.appendChild(guestHtml);
  });
}

function directMessageToAPI(guest) {
  console.log("Direct message to ", guest);
}

function subscribeToRoomAPI(room) {
  console.log("Subscribe to room", room);

  const message = {
    topic: MessageTopics.System,
    action: SystemMessageAction.subscribe,
    participant: meID,
    room: room,
  };

  ws.send(JSON.stringify(message));
}

function handleDirectMessages(message) {}

function handleChatMessages(message) {}

var meID;
var ws;
var WS_SERVER_URL = "ws://localhost:3030";
