import { createServer } from "http";
import { Server, Socket } from "socket.io";
import express from "express";
import { v4 as uuidV4 } from "uuid";
const app = express();
const http = createServer(app);
const io = new Server(http);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("./src/public"));
app.set("view engine", "ejs");
app.set("views", "./src/public/views");

const rooms: { [key: string]: { players: string[]; id: string } } = {};

app.get("/", (_, res) => {
  res.render("index");
});

app.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  if (rooms[roomId]) {
    res.render("game");
  } else {
    res.render("index", { error: "Game not found" });
  }
});

app.post("/:roomId", (req, res) => {
  const { roomId } = req.params;
  if (req.body["redirect"] == true) {
    if (rooms[roomId]) {
      if (Object.values(rooms[roomId]["players"]).length == 2) {
        res.sendStatus(403);
      } else {
        res.json({ roomId: roomId });
      }
    } else {
      res.sendStatus(404);
    }
  } else if (req.body["createRoom"] == true) {
    let madeRoomId = uuidV4();
    rooms[madeRoomId] = { players: [], id: madeRoomId };
    setInterval(() => {
      delete rooms[madeRoomId];
    }, 2700000);
    res.json({ roomId: madeRoomId });
  } else {
    res.sendStatus(401);
  }
});

io.on("connection", (socket) => {
  socket.on("userJoined", (roomId, userId, cb) => {
    if (!roomId || !userId) return;
    let room = rooms[roomId];
    if (!room) return;
    let shape: string;
    if (room.players.length < 2) {
      shape = room.players[0] ? "X" : "0";
    } else {
      shape = "SP";
    }
    let newUser;
    if (shape !== "SP") {
      newUser = {
        id: userId,
        shape,
        turn: null,
      };
    }
    let oldUser;
    if (room.players[0]) {
      oldUser = {
        id: room.players[0],
        shape: "0",
        turn: null,
      };
    }
    socket.join(roomId);
    room.players.push(userId);
    cb(shape);
    io.sockets.to(roomId).emit("playerJoined", newUser, oldUser);
  });
  socket.on(
    "chosenSquare",
    (roomId: string, userId: number, postion: number) => {
      io.sockets.to(roomId).emit("chosedSquare", userId, postion);
    }
  );
  socket.on("reset", (roomId: string) => {
    io.sockets
      .to(roomId)
      .emit("resetGame", ["0", "X"][Math.floor(Math.random() * 2)]);
  });
});

http.listen(PORT, () => console.log("http://localhost:3000"));
