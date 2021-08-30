import path from 'path';
import http from 'http';
import express from 'express';
import multer from 'multer';
const WebSocketServer = new require('ws');
import { v4 as uuidv4 } from 'uuid';
import stringHash from "string-hash";
const DIST_DIR = path.resolve(__dirname),
  INDEX_HTML = path.resolve(__dirname, 'index.html'),
  SERVER_PORT = 8000,
  WS_PORT = 8080;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, 'images'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})
const upload = multer({ storage })

let clients = {};
const users = [];
const messages = [];
const avatarMap = {};

const app = express();
app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
  res.sendFile(INDEX_HTML);
});

app.post('/upload', upload.single('image'), (req, res) => {
  res.status(200).send({
    image: `images/${req.file.filename}`
  });
})

const server = http.createServer(app);

const webSocketServer = new WebSocketServer.Server({ port: WS_PORT });

server.listen(SERVER_PORT, () => {
  console.log(`Сервер запущен на порту ${SERVER_PORT}`);
})

webSocketServer.on('connection', function (ws) {
  const clientId = uuidv4();
  clients[clientId] = ws;

  ws.send(JSON.stringify({ users: users, messages: messages }));

  ws.on('message', function (receivedMsg) {
    const { type, user, message } = JSON.parse(receivedMsg);

    switch (type) {
      case 'connection':
        const msgText = `${user.name} (${user.nickName}) вошел в чат`;

        const hashName = stringHash(`${user.name}-${user.nickName}`);
        if (hashName in avatarMap) {
          user.avatar = avatarMap[hashName];
        }
        else {
          avatarMap[hashName] = user.avatar;
        }

        users.push({ id: clientId, type: type, user: user });


        messages.push({ id: clientId, type: type, user: user, message: msgText });
        sendBroadcastMessage(JSON.stringify({
          users: users,
          messages: [{ id: clientId, type: type, user: user, message: msgText }],
          avatars: avatarMap
        }));
        break;
      case 'user':

        sendBroadcastMessage(JSON.stringify({
          users: [],
          messages: [{ id: clientId, type: type, user: user, message: message }],
        }));
        messages.push({ id: clientId, type: type, user: user, message: message });
        break;
      case 'avatar':
        const hash = stringHash(`${user.name}-${user.nickName}`);
        avatarMap[hash] = user.avatar;
        updateMesaagesWithAvatar(clientId, user.avatar);
        sendBroadcastMessage(JSON.stringify({
          users: [],
          messages: [{ id: clientId, type: type, avatarSrc: user.avatar }],
        }));
        break;
    }
  });

  ws.on('close', function () {
    const closedIdx = users.findIndex((user) => user.id === clientId);
    const removedUser = users[closedIdx].user;
    const msgText = `${users[closedIdx].user.name} (${users[closedIdx].user.nickName}) вышел из чата`;
    messages.push({ id: clientId, type: 'connection', user: users[closedIdx].user, message: msgText });

    users.splice(closedIdx, 1);
    sendBroadcastMessage(JSON.stringify({
      users: users,
      messages: [{ id: clientId, type: 'connection', user: removedUser, message: msgText }]
    }));

    delete clients[clientId];
  });

  function sendBroadcastMessage(message) {
    for (const id in clients) {
      clients[id].send(message);
    }
  };

  function updateMesaagesWithAvatar(clientId, userAvatar) {
    messages.forEach((msg) => {
      if (msg.id === clientId) {
        msg.user.avatar = userAvatar;
      }
    })
  };
});