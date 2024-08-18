const { Server } = require('socket.io');
const serverless = require('serverless-http');
const Pusher = require('pusher');
const express = require('express');

const app = express();
const httpServer = require('http').createServer(app);

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  connectionStateRecovery: {},
});

const users = {};

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('new-user-joined', (name) => {
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
  });

  socket.on('send', (message) => {
    socket.broadcast.emit('receive', {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('left', users[socket.id]);
    delete users[socket.id];
  });
});

// Use serverless-http to wrap the server
module.exports = app;
module.exports.handler = serverless(httpServer);
