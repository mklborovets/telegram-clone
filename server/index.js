const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer, WebSocket } = require('ws');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const clients = new Map();

app.get('/', (req, res) => {
  res.json({
    name: 'Telegram Clone Real-Time Socket Server',
    status: 'running',
    connectedClients: clients.size,
    uptime: process.uptime(),
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/api/auth', (req, res) => {
  try {
    const userData = req.body;
    if (!userData || !userData.id) {
      return res.status(400).json({ error: 'User id is required' });
    }
    const user = db.upsertUser(userData);
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const users = db.getUsers(query);
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages/:chatId', (req, res) => {
  try {
    const messages = db.getMessages(req.params.chatId);
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(payload, excludeWs = null) {
  const data = JSON.stringify(payload);
  for (const [wsClient] of clients.entries()) {
    if (wsClient !== excludeWs && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(data);
    }
  }
}

wss.on('connection', (ws) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  clients.set(ws, { id: clientId, user: null, activeChatId: null });

  console.log(`[Socket] Client connected: ${clientId} (Total: ${clients.size})`);

  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    timestamp: new Date().toISOString(),
  }));

  ws.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      const clientData = clients.get(ws) || {};

      switch (message.type) {
        case 'auth': {
          clientData.user = message.user;
          clients.set(ws, clientData);

          if (message.user && message.user.id) {
            db.upsertUser({ ...message.user, isOnline: true });
            db.setUserOnline(message.user.id, true);
            console.log(`[Socket] User authenticated: ${message.user.name} (${message.user.id})`);

            broadcast({
              type: 'user_status',
              userId: message.user.id,
              isOnline: true,
            }, ws);

            const pending = db.getMessagesForUser(message.user.id);
            if (pending.length > 0) {
              ws.send(JSON.stringify({
                type: 'sync_messages',
                messages: pending,
              }));
            }
          }
          break;
        }

        case 'join_chat': {
          clientData.activeChatId = message.chatId;
          clients.set(ws, clientData);
          break;
        }

        case 'leave_chat': {
          clientData.activeChatId = null;
          clients.set(ws, clientData);
          break;
        }

        case 'send_message': {
          if (!message.message) break;
          const chatId = message.message.chatId || 'general';
          console.log(`[Socket] New message in chat ${chatId}: ${message.message.text || 'media'}`);

          const storedMessage = {
            id: message.message.id,
            chatId: chatId,
            text: message.message.text || '',
            time: message.message.time,
            timestamp: message.message.timestamp || Date.now(),
            isMe: false,
            status: 'delivered',
            type: message.message.type || 'text',
            mediaUri: message.message.mediaUri || null,
            mediaType: message.message.mediaType || null,
            fileName: message.message.fileName || null,
            fileSize: message.message.fileSize || null,
            replyTo: message.message.replyTo || null,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar,
            recipientId: message.recipientId,
          };

          db.addMessage(storedMessage);

          const payload = {
            type: 'new_message',
            message: storedMessage,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar,
            recipientId: message.recipientId,
          };

          broadcast(payload, ws);
          break;
        }

        case 'edit_message': {
          console.log(`[Socket] Message edited: ${message.messageId} in chat ${message.chatId}`);
          db.editMessage(message.chatId, message.messageId, message.newText, message.editedAt);
          broadcast({
            type: 'message_edited',
            chatId: message.chatId,
            messageId: message.messageId,
            newText: message.newText,
            editedAt: message.editedAt,
          }, ws);
          break;
        }

        case 'delete_message': {
          console.log(`[Socket] Message deleted: ${message.messageId} in chat ${message.chatId}`);
          db.deleteMessage(message.chatId, message.messageId);
          broadcast({
            type: 'message_deleted',
            chatId: message.chatId,
            messageId: message.messageId,
          }, ws);
          break;
        }

        case 'typing': {
          broadcast({
            type: 'typing_status',
            chatId: message.chatId,
            userId: message.userId,
            userName: message.userName,
            isTyping: message.isTyping,
          }, ws);
          break;
        }

        case 'read_messages': {
          broadcast({
            type: 'messages_read',
            chatId: message.chatId,
            userId: message.userId,
          }, ws);
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('[Socket] Error processing message:', err.message);
    }
  });

  ws.on('close', () => {
    const clientData = clients.get(ws);
    if (clientData && clientData.user) {
      db.setUserOnline(clientData.user.id, false);
      broadcast({
        type: 'user_status',
        userId: clientData.user.id,
        isOnline: false,
      });
      console.log(`[Socket] User offline: ${clientData.user.name}`);
    }
    clients.delete(ws);
    console.log(`[Socket] Client disconnected: ${clientId} (Remaining: ${clients.size})`);
  });

  ws.on('error', (err) => {
    console.error(`[Socket] Client error (${clientId}):`, err.message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
