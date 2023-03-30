import Express from "express";
const app = Express();
import { createServer } from "http";
import CORS from "cors";
import { Server } from "socket.io";

const httpInterface = createServer(app);
const socketIO = new Server(httpInterface, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://192.168.1.25:3000",
      "http://192.168.1.25:3000/",
      "192.168.1.25:3000",
      "192.168.1.25",
    ],
  },
});

app.use(CORS());

const PORT = 4000;

let users = [];

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("message", (data) => {
    console.log("new message ", data.text);
    socketIO.emit("messageResponse", data);
  });

  socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));

  socket.on("newUser", (data) => {
    users.push(data);
    socketIO.emit("newUserResponse", users);
    console.log(users);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    users = [...users].filter((user) => user.socketID !== socket.id);
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
  console.log(users);
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

httpInterface.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
