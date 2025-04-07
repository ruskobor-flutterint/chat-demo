const guestEnterToChatForm = document.getElementById("guestEnterToChatForm");
guestEnterToChatForm.addEventListener("submit", onGuestEnter);

function onGuestEnter(event) {
  event.preventDefault();
  let alias = event.target.aliasInput.value;
  if (!alias) alias = "john doe";
  console.log("Alias chosen - ", event.target.alias.value);

  const guestSubmitButton = document.getElementById("guestSubmitButton");
  guestSubmitButton.disabled = true;

  // WS connect
  connectToWsChatService(alias);
}

console.log("Loading ChatAPI.js");

function connectToWsChatService(alias) {
  ws = new WebSocket(WS_SERVER_URL + `?alias=${alias}`);

  ws.onopen = (event) => {
    console.log("WS opened");
    document.getElementById("wsConnectedStatus").innerText = "WS connected";
    console.log(event.data);
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Recieved message: ", message);

      if (message.Hi) {
        meID = message.Hi.id;
        document.getElementById(
          "loggedUserInfo"
        ).innerText = `participant ${message.Hi["alias"]}/${message.Hi.id}`;

        return;
      }

      if (message.topic == MessageTopics.System) handleSystemMessages(message);
      if (message.topic == MessageTopics.Direct) handleDirectMessages(message);
      if (message.topic == MessageTopics.ChatRoom) handleChatMessages(message);
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
    console.log("Error: ", event);
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
  leftLobby: 3,
  joinedLobby: 4,
};

const ChatRoomMessageAction = {
  post: 0,
  joinNotifFanout: 1,
  leaveNotifFanout: 2,
  postFanout: 3,
  joined: 4,
  left: 5,
};

const DirectMessageAction = {
  post: 0,
  recieve: 1,
};

function handleSystemMessages(message) {
  if (message.action == SystemMessageAction.lobby) {
    createLobbyRoomsAndGuests(
      message.customData.rooms,
      message.customData.guests
    );
  }
  if (message.action == SystemMessageAction.leftLobby)
    updateLobbyGuests(message.customData.participantInfo, "remove");

  if (message.action == SystemMessageAction.joinedLobby)
    updateLobbyGuests(message.customData.participantInfo, "add");
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

    guestHtml.textContent = guest.alias + "/" + guest.id;
    guestHtml.addEventListener("click", () =>
      directMessageToAPI(guest.id + "")
    );
    guestHtml.id = "btn-lobby-" + guest.id;
    guestsSelection.appendChild(guestHtml);
  });
}

function updateLobbyGuests(guest, action = "add") {
  if (action == "add") {
    const lobbyGuests = document.getElementById("lobby_guests");

    const newGuestBtn = document.createElement("button");
    newGuestBtn.textContent = guest.alias + "/" + guest.id;
    newGuestBtn.id = "btn-lobby-" + guest.id;
    newGuestBtn.addEventListener("click", () =>
      directMessageToAPI(guest.id + "")
    );
    lobbyGuests.appendChild(newGuestBtn);
  }

  if (action == "remove") {
    const guestBtn = document.getElementById("btn-lobby-" + guest.id);
    guestBtn.remove();
  }
}

function directMessageToAPI(guest) {
  console.log("Direct message to ", guest);

  let promptMessage = prompt(`Write direct message to ${guest}`);

  if (promptMessage == null) {
    console.log("User canceled direct message prompt.");
    return;
  }

  const message = {
    topic: MessageTopics.Direct,
    action: DirectMessageAction.post,
    from: meID,
    to: guest,
    customData: { message: promptMessage },
  };

  ws.send(JSON.stringify(message));
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

function handleDirectMessages(message) {
  if (message.action == DirectMessageAction.recieve) {
    alertUserForDirectMessage(message);
  }
}

function alertUserForDirectMessage(message) {
  alert(
    `Direct message from ${message.from} data: ${JSON.stringify(
      message.customData
    )}`
  );
}

function handleChatMessages(message) {
  buildHtmlChatFrame(message.room);

  if (message.action == ChatRoomMessageAction.joined) {
    // Update the list of the participants
    updateChatRoomParticipants(
      message.room,
      message.customData.roomParticipants
    );
  }
  if (message.action == ChatRoomMessageAction.joinNotifFanout) {
    if (message.from != meID) {
      // participant already present from initial join
      updateChatRoomParticipants(message.room, [
        message.customData.participantInfo,
      ]);
      writeToChat(
        message.room,
        message.from,
        message.ts,
        message.customData,
        true
      );
    }
  }
  if (message.action == ChatRoomMessageAction.leaveNotifFanout) {
    updateChatRoomParticipants(
      message.room,
      [message.customData.participantInfo],
      "left"
    );
    writeToChat(
      message.room,
      message.from,
      message.ts,
      message.customData,
      true
    );
  }
  if (message.action == ChatRoomMessageAction.postFanout) {
    writeToChat(message.room, message.from, message.ts, message.customData);
  }
}

function writeToChat(chatId, from, ts, data, isSystem = false) {
  //findChatTextArea

  const chatTxtArea = document.getElementById("ta-chat-" + chatId);
  chatTxtArea.textContent += `\n [${ts}][${
    isSystem ? "SYSTEM" : from
  }] ${JSON.stringify(data)}`;
}

function updateChatRoomParticipants(roomId, particpants, action = "join") {
  // Get ul from the specific chat
  const ul = document.getElementById("ul-guests-" + roomId);

  if (action == "join") {
    particpants.forEach((p) => {
      let li = document.createElement("li");
      li.id = "li-" + roomId + "-" + p.id;
      li.textContent = p.alias + "/" + p.id;
      ul.appendChild(li);
    });
  }

  if (action == "left") {
    let liArr = [...ul.children];
    particpants.forEach((p) => {
      liArr.forEach((li) => {
        if (li.id == "li-" + roomId + "-" + p.id) {
          li.remove();
        }
      });
    });
  }
}

function buildHtmlChatFrame(chatId) {
  let chatHtml = document.getElementById("ch-" + chatId);

  if (chatHtml) {
    console.log(`Already created hmtl form for chat ${chatId}`);
    return;
  }

  chatHtml = document.createElement("chat");
  chatHtml.id = "ch-" + chatId;

  // Chat Label
  let label = document.createElement("label");
  label.textContent = chatId;

  // Append
  chatHtml.appendChild(label);

  // Chat Users section
  let div = document.createElement("div");
  div.classList.add("chat-guests");

  // Guest list in the romm
  let ul = document.createElement("ul");
  ul.id = "ul-guests-" + chatId;

  // Append stylying to the list of guests
  div.appendChild(ul);

  // Append
  chatHtml.append(div);

  // Create chat textarea
  let textarea = document.createElement("textarea");
  textarea.id = "ta-chat-" + chatId;

  //Append chat history
  chatHtml.append(textarea);

  // Create form
  let form = document.createElement("form");
  form.id = "form-chat-" + chatId;

  let fText = document.createElement("text");
  fText.textContent = "message: ";
  form.appendChild(fText);

  let inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "messageInput";
  form.appendChild(inputText);

  let inputSubmitButton = document.createElement("input");
  inputSubmitButton.type = "submit";
  inputSubmitButton.value = "Submit";
  form.appendChild(inputSubmitButton);

  let inputLeaveButton = document.createElement("input");
  inputLeaveButton.type = "button";
  inputLeaveButton.value = "Leave";
  form.appendChild(inputLeaveButton);

  // Event handlers set
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = event.target.messageInput.value;
    if (message == null) {
      console.log(`Not sending null messages to room${chatId}`);
      return;
    }
    messageRoomAPI(chatId, message);
  });

  inputLeaveButton.addEventListener("click", (event) => {
    event.preventDefault();
    leaveRoomAPI(chatId);
    chatHtml.remove();
    // clear UI , remove chat frame
  });

  chatHtml.appendChild(form);

  document.getElementById("chatRooms").append(chatHtml);
}

// TODO del
function tempFormCreate(chatId, message) {
  // Create form
  let form = document.createElement("form");
  form.id = "form-chat-" + chatId;

  let fText = document.createElement("text");
  fText.textContent = "message: ";
  form.appendChild(fText);

  let inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "alias";
  form.appendChild(inputText);

  let inputSubmitButton = document.createElement("input");
  inputSubmitButton.type = "submit";
  inputSubmitButton.value = "Submit";
  form.appendChild(inputSubmitButton);

  let inputLeaveButton = document.createElement("input");
  inputLeaveButton.type = "button";
  inputLeaveButton.value = "leave";
  form.appendChild(inputLeaveButton);

  // Event handlers set
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    messageRoomAPI(chatId, message);
    console.log(chatId + "submit");
  });

  inputLeaveButton.addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Calling leaveRoomAPI ...");
    leaveRoomAPI(chatId);
  });

  document.getElementById("lobby").append(form);
}

function messageRoomAPI(roomId, msgData, fromUser = meID) {
  console.log(`Trying to send message to room ${roomId}`);

  const message = {
    topic: MessageTopics.ChatRoom,
    action: ChatRoomMessageAction.post,
    from: fromUser,
    room: roomId,
    ts: new Date().toISOString(),
    customData: { message: msgData },
  };

  ws.send(JSON.stringify(message));
}

function leaveRoomAPI(roomId, fromUser = meID) {
  const message = {
    topic: MessageTopics.System,
    action: SystemMessageAction.unsubscribe,
    participant: fromUser,
    room: roomId,
  };

  ws.send(JSON.stringify(message));
}

var meID;
var ws;

var WS_SERVER_URL = "ws://localhost:3030";
