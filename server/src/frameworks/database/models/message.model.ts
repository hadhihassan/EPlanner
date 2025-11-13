import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
