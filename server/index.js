const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const clients = new Map();
const messagesHistory = [];

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
          console.log(`[Socket] User authenticated: ${message.user.name} (${message.user.id})`);
          broadcast({
            type: 'user_status',
            userId: message.user.id,
            isOnline: true,
          }, ws);

          if (message.user && message.user.id) {
            const pending = messagesHistory.filter(
              (m) =>
                m.recipientId === message.user.id ||
                m.senderId === message.user.id ||
                (!m.recipientId && m.message && !m.message.chatId.startsWith('direct-'))
            );
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
          console.log(`[Socket] New message in chat ${message.message.chatId}: ${message.message.text || 'media'}`);
          const payload = {
            type: 'new_message',
            message: {
              ...message.message,
              isMe: false,
            },
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar,
            recipientId: message.recipientId,
          };
          messagesHistory.push(payload);
          if (messagesHistory.length > 500) {
            messagesHistory.shift();
          }
          broadcast(payload, ws);
          break;
        }

        case 'edit_message': {
          console.log(`[Socket] Message edited: ${message.messageId} in chat ${message.chatId}`);
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
  console.log(`===============================================`);
  console.log(`🚀 Telegram Real-Time Socket Server running!`);
  console.log(`📡 HTTP:      http://localhost:${PORT}`);
  console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
  console.log(`📱 Android:   ws://10.0.2.2:${PORT}`);
  console.log(`===============================================`);
});
