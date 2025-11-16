# Socket.IO Events — EPlanner

This document describes all real-time Socket.IO events used by the EPlanner application.

The system uses 2 live layers:

1. **Global Presence Layer**  
   Tracks all users online across the application  
   → Used for participant online/offline indicators

---

# ⚡ Connection & Authentication

The client connects using:

```ts
io(VITE_SOCKET_URL, {
  auth: { token: accessToken }
});
````

Backend verifies token using:

```md
socket.handshake.auth.token
```

On success:

```md
socket.userId  
socket.userData = { id, name, email, role }
```

---

# 🌍 Global Events

## **1. globalOnlineUsers**

**Direction:** Server → All clients
**Purpose:** Shows all online users in EPlanner.

### Payload:

```json
[
  {
    "userId": "123",
    "userData": {
      "id": "123",
      "name": "Hadhi",
      "email": "h@example.com",
      "role": "organizer"
    },
    "lastSeen": "2025-01-01T10:20:20.000Z"
  }
]
```

### When Fired:

* User connects
* User disconnects
* When event or chat presence changes

---

# 📨 Notification Events

## **2. notification**

**Direction:** Server → Single user**

Delivered to room:

```
user:{userId}
```

### Payload:

```json
{
  "id": "notif-id",
  "userId": "123",
  "type": "event_created",
  "title": "Event Created",
  "content": "Your event X was created",
  "createdAt": "2025-01-01T12:00:00.000Z",
  "read": false
}
```

---

# 🏢 Notification Room Events

### **joinNotifications**

Client tells backend to subscribe:

```ts
socket.emit("joinNotifications");
```

### **leaveNotifications**

Unsubscribes from the room.

---

# Event Room Events (Per-Event)

Event rooms follow naming:

```
event:{eventId}
```

---

# joinEvent

Client joins an event room.

```ts
socket.emit("joinEvent", { eventId });
```

### Server response:

* Sends **chatHistory**
* Sends **eventOnlineUsers**

---

# leaveEvent

```ts
socket.emit("leaveEvent", { eventId });
```

User will be removed from event online map.

---

# 💬 Chat Events

## **chatHistory**

**Direction:** Server → Single client**

```json
[
  {
    "id": "msg1",
    "eventId": "ev123",
    "userId": "u1",
    "createdAt": "2025-01-01T12:00:00",
    "text": "Hello!",
    "user": { "name": "Hadhi", "email": "h@example.com" }
  }
]
```

Sent only once when user joins a room.

---

## **eventChatMessage**

**Direction:** Client → Server**

```ts
socket.emit("eventChatMessage", {
  eventId,
  text
});
```

**Direction:** Server → All users in event room

```
newChatMessage
```

### newChatMessage Payload:

```json
{
  "id": "msg2",
  "eventId": "ev123",
  "userId": "u2",
  "text": "Welcome!",
  "createdAt": "2025-01-01T12:01:00",
  "user": { "name": "Hassan" }
}
```

---

## **Typing Indicator**

### Client → Server

```ts
socket.emit("typing", {
  eventId,
  isTyping: true
});
```

### Server → Room

```
userTyping
```

Payload:

```json
{
  "userId": "123",
  "isTyping": true,
  "userData": { "name": "Hadhi" }
}
```
---

# Summary Table

| Event Name           | Direction       | Description              |
| -------------------- | --------------- | ------------------------ |
| `globalOnlineUsers`  | server → client | Entire app users online  |
| `notification`       | server → client | In-app notification      |
| `joinNotifications`  | client → server | Subscribes to notif room |
| `leaveNotifications` | client → server | Unsubscribes             |
| `joinEvent`          | client → server | Join event chat          |
| `leaveEvent`         | client → server | Leave event chat         |
| `chatHistory`        | server → client | Event chat history       |
| `eventOnlineUsers`   | server → client | Online users in event    |
| `eventChatMessage`   | client → server | Send message             |
| `newChatMessage`     | server → room   | Broadcast message        |

---