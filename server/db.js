const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_USERS = [
  {
    id: 'user-demo-alex',
    name: 'Alex Romanov',
    username: 'alex_rn',
    phone: '+380 98 123 45 67',
    bio: 'Mobile architect & open source contributor',
    avatarUrl: '',
    isOnline: false,
  },
  {
    id: 'user-demo-sarah',
    name: 'Sarah Jenkins',
    username: 's_jenkins',
    phone: '+380 50 987 65 43',
    bio: 'Product Designer @ Telegram Team',
    avatarUrl: '',
    isOnline: false,
  },
  {
    id: 'user-demo-elena',
    name: 'Elena Rostova',
    username: 'elena_r',
    phone: '+380 50 111 22 33',
    bio: 'Frontend engineer & open source enthusiast',
    avatarUrl: '',
    isOnline: false,
  },
  {
    id: 'user-demo-michael',
    name: 'Michael Chen',
    username: 'mchen_dev',
    phone: '+1 415 890 12 34',
    bio: 'Backend & Infrastructure Engineer @ TechCorp',
    avatarUrl: '',
    isOnline: false,
  },
  {
    id: 'user-demo-durov',
    name: 'Pavel Durov',
    username: 'durov',
    phone: '+971 50 123 45 67',
    bio: 'Building Telegram & TON',
    avatarUrl: '',
    isOnline: false,
  },
];

class Database {
  constructor() {
    this.data = {
      users: [...INITIAL_USERS],
      messages: [],
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          const existingIds = new Set(parsed.users.map((u) => u.id));
          const mergedUsers = [...parsed.users];
          for (const demoUser of INITIAL_USERS) {
            if (!existingIds.has(demoUser.id)) {
              mergedUsers.push(demoUser);
            }
          }
          this.data = {
            users: mergedUsers,
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
          };
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[DB] Error initializing database:', err.message);
    }
  }

  save() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving database:', err.message);
    }
  }

  getUsers(query = '') {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    if (!q) {
      return this.data.users;
    }
    return this.data.users.filter((u) => {
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchUser = (u.username || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
      return matchName || matchUser || matchPhone;
    });
  }

  findUserById(id) {
    if (!id) return undefined;
    return this.data.users.find((u) => u.id === id);
  }

  findUserByPhone(phone) {
    if (!phone) return undefined;
    const cleanTarget = phone.replace(/\D/g, '');
    if (!cleanTarget) return undefined;
    return this.data.users.find(
      (u) => (u.phone || '').replace(/\D/g, '') === cleanTarget
    );
  }

  upsertUser(user) {
    if (!user || !user.id) return null;
    const cleanPhone = (user.phone || '').replace(/\D/g, '');
    const existingIndex = this.data.users.findIndex(
      (u) =>
        u.id === user.id ||
        (Boolean(cleanPhone) && (u.phone || '').replace(/\D/g, '') === cleanPhone)
    );

    const safeUser = {
      id: user.id,
      name: user.name || 'Telegram User',
      username: (user.username || '').replace(/^@/, '').trim(),
      phone: user.phone || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      isOnline: Boolean(user.isOnline),
      lastSeen: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.users[existingIndex] = {
        ...this.data.users[existingIndex],
        ...safeUser,
      };
    } else {
      this.data.users.push(safeUser);
    }

    this.save();
    return existingIndex >= 0 ? this.data.users[existingIndex] : safeUser;
  }

  setUserOnline(userId, isOnline) {
    const user = this.findUserById(userId);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date().toISOString();
      this.save();
    }
  }

  getMessages(chatId) {
    if (!chatId) return [];
    return this.data.messages.filter((m) => m.chatId === chatId);
  }

  getMessagesForUser(userId) {
    if (!userId) return [];
    return this.data.messages.filter(
      (m) =>
        m.recipientId === userId ||
        m.senderId === userId ||
        (m.chatId && !m.chatId.startsWith('direct_') && !m.chatId.startsWith('direct-'))
    );
  }

  addMessage(message) {
    if (!message || !message.id) return null;
    const exists = this.data.messages.some((m) => m.id === message.id);
    if (exists) return message;

    this.data.messages.push(message);
    if (this.data.messages.length > 2000) {
      this.data.messages.shift();
    }
    this.save();
    return message;
  }

  editMessage(chatId, messageId, newText, editedAt) {
    const msg = this.data.messages.find(
      (m) => m.id === messageId && (m.chatId === chatId || !chatId)
    );
    if (msg) {
      msg.text = newText;
      msg.isEdited = true;
      msg.editedAt = editedAt || new Date().toISOString();
      this.save();
      return msg;
    }
    return null;
  }

  deleteMessage(chatId, messageId) {
    const initialLen = this.data.messages.length;
    this.data.messages = this.data.messages.filter(
      (m) => !(m.id === messageId && (m.chatId === chatId || !chatId))
    );
    if (this.data.messages.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

const db = new Database();

module.exports = db;
