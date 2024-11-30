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
app.use(express.json()); // For parsing JSON bodies in POST requests

// Admin endpoint to fetch connected users
app.get("/admin/users", (req, res) => {
  res.json(users);
});

// Admin endpoint to kick a user
app.post("/admin/kick", (req, res) => {
  const { id } = req.body;
  if (users[id]) {
    io.to(id).emit("kicked", "You have been removed by the admin."); // Notify the user
    delete users[id]; // Remove user from list
    res.send("User kicked successfully.");
  } else {
    res.status(404).send("User not found.");
  }
});

// WebSocket connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle new user joining
  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    io.emit("update-users", users); // Notify admin of user list updates
    console.log(`${name} joined with ID: ${socket.id}`);
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
    io.emit("update-users", users); // Notify admin of user list updates
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
