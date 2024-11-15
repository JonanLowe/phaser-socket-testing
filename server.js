const express = require("express");
const app = express();
const http = require("http");

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server);

let players = {};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("a user connected");
  console.log(players, "<<<< players at the beginning");

  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue",
  };
  console.log(players, "players");
  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // update all other players of the new player

  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("disconnect", function () {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    socket.disconnect(socket.id);
  });

  // when a player moves, update the player data
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});

server.listen(8085, function () {
  console.log(`Listening on ${server.address().port}`);
});
