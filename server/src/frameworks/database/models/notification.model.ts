import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
  type: { 
    type: String, 
    enum: ['event_reminder', 'event_created', 'event_updated', 'event_deleted', 'daily_digest', 'user_added'],
    required: true 
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);

