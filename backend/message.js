// Server.js (Simplified)
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app); // Wrap Express
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' } // Allow React to talk to us
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  // track username for this socket
  socket.data.username = null;

  // client announces their username after connecting
  socket.on('join', (username) => {
    socket.data.username = username || 'Anonymous';
    console.log(`${socket.data.username} joined (${socket.id})`);
    // notify everyone (including the new user)
    io.emit('user_joined', { id: socket.id, username: socket.data.username });
  });

  // chat messages from clients
  socket.on('chat_message', (payload) => {
    const message = {
      id: socket.id,
      username: socket.data.username || 'Anonymous',
      text: payload && payload.text ? payload.text : '',
      time: Date.now()
    };
    // send to all clients including sender
    io.emit('chat_message', message);
  });

  socket.on('disconnect', (reason) => {
    console.log('A user disconnected:', socket.id, 'reason:', reason);
    if (socket.data.username) {
      io.emit('user_left', { id: socket.id, username: socket.data.username });
    }
  });
});

// Serve a simple test page at /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(3001, () => console.log('Server running on http://localhost:3001'));