const usersList = document.getElementById("users");
const board = document.getElementById("board");
const userMessage = document.getElementById("msg_txt");
const userName = document.getElementById("msg_name");
const sendButton = document.getElementById("msg_btn");

// connects the socket.io instance
const socket = io();
// stores messages here
const messages = [];
// sets a limit on the maximum number of messages on the screen
const LIMIT_MESSAGES = 10;

// universal function to render content
const render = (body, elements) => {
  body.innerHTML = "";
  const fragment = document.createDocumentFragment();

  elements.forEach((element) => {
    fragment.appendChild(element);
  });

  body.appendChild(fragment);
};

const renderListOfMessages = ({ name, message }) => {
  const divName = document.createElement("DIV");
  divName.className = "alert alert-primary col-md-3";
  divName.textContent = name;

  const divMessage = document.createElement("DIV");
  divMessage.className = "alert alert-dark col-md-9";
  divMessage.textContent = message;

  const divWrapper = document.createElement("DIV");
  divWrapper.className = "row";

  divWrapper.appendChild(divName);
  divWrapper.appendChild(divMessage);

  // inserts new elements at the start of an array, and returns the new length of the array.
  if (messages.unshift(divWrapper) > LIMIT_MESSAGES) {
    messages.pop(); // if the messages array length exceeds LIMIT_MESSAGES, we remove the last one
  }

  render(board, messages); // renders messages  to the board DIV
};

const renderListOfUsers = (data) => {
  const userElement = Object.values(data).map((user) => {
    const li = document.createElement("LI");
    li.classList.add("list-group-item");
    li.textContent = user;
    return li;
  });
  render(usersList, userElement);
};

// checks if the pressed key is Enter, if it is, it sends the message
const pressEnterKey = (e) => {
  if (e.keyCode === 13) {
    sendUserMessage();
  }
};

const sendUserMessage = () => {
  // we use let, because on the server side we check if the user has changed his name
  let name = userName.value.trim();
  const message = userMessage.value.trim();

  if (message === "" || name === "") {
    return;
  }

  socket.emit("message", {
    message,
    name,
  });

  userMessage.value = "";
  userMessage.focus();
};

sendButton.addEventListener("click", sendUserMessage);
userMessage.addEventListener("keyup", pressEnterKey);

socket.on("user", renderListOfUsers);
socket.on("message", renderListOfMessages);
