const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('new_user', (username) => {
    socket.username = username;
    io.emit('receive_message', { system: true, text: `${username} joined the chat.` });
  });

  socket.on('send_message', (data) => {
    io.emit('receive_message', data); // broadcast to all
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('receive_message', { system: true, text: `${socket.username} left the chat.` });
    }
    console.log('A user disconnected:', socket.id);
  });
});

app.get("/", (req, res) => res.send("Server is running"));

const PORT = 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
