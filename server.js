const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let agents = {}; // 儲存客服 socket
let clients = {}; // 儲存客戶 socket

io.on('connection', (socket) => {
  console.log('新使用者連線', socket.id);

  socket.on('register', (role) => {
    if (role === 'agent') {
      agents[socket.id] = socket;
      console.log('客服登入:', socket.id);
    } else {
      clients[socket.id] = socket;
      console.log('客戶登入:', socket.id);

      // 通知客服有新客戶
      for (let id in agents) {
        agents[id].emit('new_client', socket.id);
      }
    }
  });

  socket.on('message', ({ to, message }) => {
    if (io.sockets.sockets.get(to)) {
      io.to(to).emit('message', {
        from: socket.id,
        message
      });
    }
  });

  socket.on('disconnect', () => {
    delete agents[socket.id];
    delete clients[socket.id];
    console.log('使用者離線:', socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
