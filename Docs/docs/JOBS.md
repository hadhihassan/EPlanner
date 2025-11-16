
# Background Job System — EPlanner

EPlanner uses **BullMQ** + **Redis** + **MongoDB job metadata** :

### ✔ Event reminders (1 hour before event start)  
### ✔ Daily digest email (8 AM UTC)  
### ✔ In-app notifications  
### ✔ Email sending via SendGrid  
### ✔ Automatic job cleanup on event updates  

This document explains queues, workers, scheduling strategy, job lifecycle, and metadata flow.

---

# Queues

EPlanner has **two queues**:

|   Queue Name  |             Purpose                |
|---------------|------------------------------------|
| `reminders`   | Event reminders (1 hour before)    |
| `dailyDigest` | Daily digest emails (once per day) |

Defined in:

```md

server/src/frameworks/jobs/queue.ts

```

---

# 1. Event Reminder Job (Per Event)

### Triggered when:
- Event created  
- Event startAt updated  
- Event time rescheduled  

### Scheduling logic:
```ts
const reminderTime = new Date(startAt - 1hr);

if (reminderTime > now)
   schedule job
else
   don't schedule
```

### Stored metadata model:

```json
{
  "event": "eventId",
  "type": "eventReminder",
  "queueName": "reminders",
  "jobId": "eventReminder:eventId:timestamp"
}
```

### Worker Behavior:

File:

```
src/frameworks/jobs/worker.ts
```

Steps:

1. Load event + participants + organizer
2. Build HTML email
3. Send via SendGrid
4. Create in-app notification
5. Broadcast notification via Socket.IO

---

# Reminder Email Example

Subject:

```
Reminder: Event XYZ starts in 1 hour
```

HTML Body:

```
<h2>Event Reminder</h2>
<p>Your event "XYZ" starts at 4:00 PM</p>
```

---

# Job Removal (When Event Updated)

When event time changed:

```
removeAllEventJobs(eventId)
```

This removes:

* BullMQ job
* Mongo job metadata

Preventing "duplicate reminders".

---

# 2. Daily Digest Job (8 AM UTC)

### Purpose:

Every morning:

* Collect all events happening **tomorrow**
* Group them by user
* Email each user their upcoming schedule
* Create in-app digest notification

### Schedule configuration:

```ts
repeat: {
  pattern: "0 8 * * *",
  tz: "UTC"
}
```

### Fix included:

Before scheduling daily digest:

* Removes ALL existing repeatable jobs
* Removes all job metadata in Mongo
* Schedules one clean recurring job

Ensures:
✔ No duplicates
✔ No multiple daily emails

---

# Daily Digest Email Structure

Example HTML:

```html
<h2>Daily Event Digest</h2>
<p>You have 3 events tomorrow:</p>
<ul>
  <li>Team Sync – 9:00 AM</li>
  <li>Demo – 11:00 AM</li>
  <li>Workshop – 2:00 PM</li>
</ul>
```

---

# Worker Infrastructure

Worker runs separately from API server:

```
npm run worker
```

Worker does:

* Connect to Mongo
* Connect to Redis
* Run handlers for queues
* Emit notifications via Socket.IO
* Send emails via SendGrid

Works independently from main Express server.

---

# Job Metadata Storage

Stored in MongoDB collection: `jobmetas`.

Fields:

```json
{
  "event": "eventId or null",
  "queueName": "reminders|dailyDigest",
  "jobId": "unique bullmq id",
  "type": "eventReminder|dailyDigest"
}
```

Used to:

* Track scheduled jobs
* Remove stale jobs
* Prevent duplicates

---

# Job Lifecycle (Example)

## 1. Creating Event

```
POST /event
↓
scheduleEventReminder()
↓
Job added to BullMQ
↓
Job metadata saved in Mongo
```

## 2. At Execution Time

```
Worker pulls job
↓
Fetch event & users
↓
Send email
↓
Create DB notification
↓
Emit Socket.IO notification
↓
Job complete
```

## 3. Updating Event Time

```
removeAllEventJobs()
↓
Schedule new job
↓
Save new metadata
```

---

# Testing Jobs Locally

### 1. Start Redis

```
docker run -p 6379:6379 redis
```

### 2. Start API Server

```
npm run dev
```

### 3. Start Worker

```
npm run worker
```

### 4. Create an event 5 mins in the future

Set:

```
startAt = now + 1hr + 1min
```

Then reduce reminder to 2 min for testing if needed.

---