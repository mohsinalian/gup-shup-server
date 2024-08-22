const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow requests from all origins
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {},
});

const users = {};

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
  });
});

httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 3000}`);
});
