# EPlanner — Event Management, Real-Time Chat & Notifications Platform

EPlanner is a full-stack event management system built with a modern MERN architecture, real-time chat using Socket.IO, background job scheduling with BullMQ, and robust email notifications via SendGrid.

This project supports:
- Event creation, update, deletion  
- File uploads with Cloudinary  
- Real-time chat per-event  
- Live participant online/offline tracking  
- In-app + email notifications  
- Automated reminders  
- Daily email digest  
- Role-based access control (Admin / Organizer / Participant)

---

## Tech Stack

### **Frontend**
- React 19
- Redux Toolkit
- TypeScript
- Vite
- TailwindCSS
- Socket.IO Client
- React Hook Form / Yup

### **Backend**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Redis + BullMQ (Render Redis)
- Socket.IO Server
- SendGrid Email API
- Cloudinary
- JWT Access/Refresh Tokens
- Zod validation

### **Infrastructure**
- Render (Backend)
- Render (Frontend)
- Render KV Redis (Queues)
- Cloudinary (File uploads)
- SendGrid (Email delivery)

---

# Features

### Event Management  
- Create, update, delete events  
- Upload attachments via Cloudinary  
- Pagination + search + text index  
- Status filters (upcoming/ongoing/completed)

### Real-Time Chat  
- Per-event chat rooms    
- Chat history (Mongo stored)  
- Per-event online users list  

### Live Participant Presence  
- Event-specific online users (for chat)  
- Presence updates on connect/disconnect  

### Notifications System  
- In-app notifications (Socket.IO)  
- Email notifications (SendGrid)  
- Mark as read / mark all read  
- Notification center (frontend)

### Background Jobs (BullMQ Worker)
- 1-hour-before event reminders  
- Daily digest at 8 AM UTC  
- Job metadata stored in Mongo  
- Automatic cleanup when event updates  

---

# Local Development Setup

## 1. Clone the repository
```

git clone https://github.com/hadhihassan/EPlanner.git
cd EPlanner

```

---

# 🔧 Backend Setup (`/server`)

### Install dependencies
```

cd server
npm install

````

### Create **.env**
```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/eplanner
JWT_ACCESS_SECRET=supersecret_access_key
JWT_REFRESH_SECRET=supersecret_refresh_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=15m
JWT_SECRET=jwtsecret
SENDGRID_API_KEY=your-sendgrid-api-key
SENDER_EMAIL=no-reply@lilibrary.shop
SENDER_NAME=EPlanner
# Redis: Local
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# Redis: Render (production)
REDIS_URL=redis://....
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=http://localhost:5173
````

### Start backend (dev)

```
npm run dev
```

---

# Frontend Setup (`/frontend`)

### Install dependencies

```
cd frontend
npm install
```

### Create `.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

### Start frontend

```
npm run dev
```
---

# Socket.IO Events

Detailed documentation available in:

👉 [`DOCS/SOCKET_EVENTS.md`](DOCS/SOCKET_EVENTS.md)

Includes:

* joinEvent
* leaveEvent
* eventChatMessage
* chatHistory
* eventOnlineUsers
* globalOnlineUsers
* notification
* typing events

---

# Background Jobs (BullMQ)

Full explanation available in:

👉 [`DOCS/JOBS.md`](DOCS/JOBS.md)

Covers:

* Queue structure
* remindersWorker
* dailyDigestWorker
* Schedule logic
* Repeatable job cleanup
* Metadata storage in Mongo
* How jobs trigger email + in-app notifications

---

# Folder Structure (Backend)

```
server/
 ├── src/
 │   ├── adapters/
 │   │   ├── controllers/
 │   │   ├── repositories/
 │   │   └── services/
 │   ├── entity/
 │   ├── frameworks/
 │   │   ├── config/
 │   │   ├── database/
 │   │   ├── jobs/
 │   │   ├── sockets/
 │   │   └── web/
 │   ├── usecase/
 │   ├── main.ts
 │   └── worker.ts
 └── package.json
```

---

## Screenshots

Below are key screens from **EPlanner** showcasing authentication, event management, real-time chat, online presence, and notifications.

### Login
<p align="center">
  <img src="<./server/publick/login.png>" alt="Login Page" width="750" />
</p>

---

### Register
<p align="center">
  <img src="<https://github.com/hadhihassan/EPlanner/blob/main/server/public/register.png?raw=true>" alt="Register Page" width="750" />
</p>

---

### Dashboard
Shows upcoming, ongoing, completed events, filters, search & pagination.
<p align="center">
  <img src="<DASHBOARD_SCREENSHOT_URL>" alt="Dashboard" width="750" />
</p>

---

### Calendar View
<p align="center">
  <img src="<CALENDAR_SCREENSHOT_URL>" alt="Calendar View" width="750" />
</p>

---

#### Chat
<p align="center">
  <img src="<CHAT_SCREENSHOT_URL>" alt="Event Chat" width="750" />
</p>

---

#### Participants
<p align="center">
  <img src="<PARTICIPANTS_SCREENSHOT_URL>" alt="Event Participants" width="750" />
</p>

---

###  Notifications Panel
Includes in-app notifications + unread count sync.
<p align="center">
  <img src="<NOTIFICATIONS_SCREENSHOT_URL>" alt="Notifications Panel" width="750" />
</p>


---
 Deployment Notes

### Backend (Render)

* Use the worker process for BullMQ
* Add all environment variables
* Ma sure Redis URL exists
* Enable WebSockets

### Frontend (Render)

* Set `VITE_API_URL` properly
* Ena static deployment

---