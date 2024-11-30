const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const path = require("path");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const users = {};

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Admin endpoint to fetch connected users
app.get("/admin/users", (req, res) => {
  res.json(users);
});

// Admin endpoint to kick a user
app.post("/admin/kick", (req, res) => {
  const { id } = req.body;
  if (users[id]) {
    io.to(id).emit("kicked", "You have been removed by the admin.");
    delete users[id];
    res.send("User kicked successfully.");
  } else {
    res.status(404).send("User not found.");
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    io.emit("update-users", users); // Notify admin of user list updates
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("update-users", users); // Notify admin of user list updates
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});
