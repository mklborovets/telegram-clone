# ✈️ Telegram Clone — React Native

A high-performance, feature-packed **Telegram Clone** built with **React Native (0.88)**, **TypeScript**, and **Feature-Sliced Design (FSD)** architecture. Features real-time multi-device chat synchronization over WebSockets, smooth gestures, and authentic Telegram aesthetics.

---

## ✨ Features

### ⚡ Real-Time Messaging & Synchronization
- **WebSocket Server**: Built-in lightweight real-time server (`node server/index.js`).
- **Instant Messaging**: Cross-platform chat sync between Android, iOS, and multiple clients.
- **Live Statuses**: Real-time typing indicators, user online/offline status, and read receipts.
- **Message Operations**: Live edit and delete synced across all connected devices in real time.

### 💬 Chat Experience
- **Interactive Message Bubbles**: Seamless timestamps, status ticks (`sent`, `delivered`, `read`), and edit badges.
- **Media & Document Support**: Image gallery picking and document picking via modern native pickers.
- **Message Actions**: Copy text, edit message, delete, and reply with custom modals.
- **Contextual Search**: Fast debounced search across chats and messages.

### 📂 Organization & Gestures
- **Custom Chat Folders**: Filter by *All*, *Work*, *Personal*, or create custom folders with custom badges.
- **Swipe Actions**: Interactive swipe-to-reveal actions — **Pin**, **Mute**, **Archive**, **Delete**, and **Mark as Read**.
- **Archive Card**: Native pull-down sticky archive drawer.
- **Navigation Drawer**: Telegram-style drawer with profile header, folder shortcuts, and settings.

### 👤 Authentication & Profiles
- **Onboarding & Auth Flow**: Phone number entry with country picker (+380, +1, +44, etc.) and verification.
- **Multi-Account Demo Switcher**: Instant switching between preset accounts (*Alex Romanov*, *Sarah Jenkins*, *Elena Rostova*, *Michael Chen*, *Pavel Durov*) for easy multi-device testing.
- **Detailed Profiles**: User & group profile pages with shared media tabs (*Media*, *Files*, *Links*, *Voice*).

---

## 🏗️ Architecture (Feature-Sliced Design)

The project strictly follows the **Feature-Sliced Design (FSD)** methodology:

```text
src/
├── app/                  # App initialization, providers, navigation setup
│   └── navigation/       # RootNavigator, MainNavigator
├── pages/                # Screen views (AuthPage, ChatListPage, ChatRoomPage, ProfilePage, FolderManagerPage)
├── widgets/              # Composite UI blocks (ChatList, ChatRoomView, NavigationDrawer, SwipeableTabs)
├── features/             # User interactions (SendMessageBar, ChatSwipeActions)
├── entities/             # Business logic & stores
│   ├── chat/             # Chat store, model, types, ChatRow
│   ├── message/          # Message store, model, types, MessageBubble
│   └── user/             # User store, demo profiles, auth state
└── shared/               # Reusable primitives, theme, UI kit, lib
    ├── config/theme.ts   # Telegram color palette & design tokens
    ├── lib/              # SocketClient, useSocketSync, phone helpers, mediaPicker, safeAsyncStorage
    └── ui/               # CustomButton, IconButton, Avatar, SlideScreen, ConfirmModal
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React Native 0.88](https://reactnative.dev) (New Architecture ready) |
| **Language** | [TypeScript 6](https://www.typescriptlang.org/) |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) with persistent storage |
| **Animations & Gestures** | [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) & [Gesture Handler 3](https://docs.swmansion.com/react-native-gesture-handler/) |
| **Real-time Server** | Node.js + [Express](https://expressjs.com/) + [ws (WebSocket)](https://github.com/websockets/ws) |
| **Icons** | [Lucide React Native](https://lucide.dev/) |
| **Safe Area & UI** | `react-native-safe-area-context`, `react-native-svg` |
| **Document & Media** | `@react-native-documents/picker`, `react-native-image-picker` |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 22.11.0
- JDK 17 (e.g. `openjdk@17`)
- Android Studio / Android SDK (for Android)
- Xcode & CocoaPods (for iOS)

### 2. Install Dependencies
```bash
npm install
```

For iOS:
```bash
cd ios && pod install && cd ..
```

### 3. Start the Real-Time Socket Server
Run the local WebSocket backend server (listens on port 3000):
```bash
npm run server
```

> **Note**: Android emulators automatically connect via `ws://10.0.2.2:3000`, and iOS simulators via `ws://localhost:3000`.

### 4. Start Metro Bundler
In a separate terminal:
```bash
npm start
```

### 5. Run the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

---

## 🔄 Multi-Device Real-Time Testing

You can test real-time communication between two clients simultaneously:

1. Start the server: `npm run server`
2. Launch the app on **Android Emulator**:
   - Sign in as **Alex Romanov**
3. Launch the app on **iOS Simulator**:
   - Sign in as **Sarah Jenkins**
4. Open the direct chat between Alex and Sarah.
5. Messages, live typing indicators, edits, and deletions will synchronize instantly across both devices!

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
