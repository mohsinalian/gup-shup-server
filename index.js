const http = require('http');
const { Server } = require('socket.io');
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1851257',
  key: 'c8687ec0d64086e3c67f',
  secret: '6c6657775b6fdd3e72ce',
  cluster: 'ap2',
  useTLS: true,
});

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow requests from all origins
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

httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 3000}`);
});
