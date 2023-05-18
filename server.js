const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running in port 3000, http://localhost:3000/");
});

app.use(express.static(__dirname + "/public"));

// here we'll store connected users
const users = {};

// "client" is a parameter name that represents the socket object that is returned by the "io.sockets.on('connection', ...)" event.
io.sockets.on("connection", (client) => {
  const broadcast = (event, data) => {
    client.emit(event, data); // sends the data specifically for the current user
    client.broadcast.emit(event, data); // fires an event for all other connected users
  };

  broadcast("user", users); // when a user connects for the 1st time, we execute the "user" event, and inform all chat participants, our current list of users

  client.on("message", (message) => {
    // 1st we check if the user's ID in the users object is not already associated with the name that came with the message. If not, the users object is updated with the new name for that user ID
    if (users[client.id] !== message.name) {
      users[client.id] = message.name;

      // ensures that the list of users displayed in the chat stays up-to-date with the latest user names.
      broadcast("user", users);
    }
    broadcast("message", message);
  });

  client.on("disconnect", () => {
    delete users[client.id];
    client.broadcast.emit("user", users);
  });
});
