import mongoose, { Schema } from 'mongoose';

const AttachmentSchema = new Schema({
  url: String,
  filename: String,
  provider: String
}, { _id: false });

const EventSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: String,
  category: String,
  startAt: { type: Date, required: true, index: true },
  endAt: Date,
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  location: String,
  attachments: [AttachmentSchema],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  jobId: String
}, { timestamps: true });

EventSchema.index({
  title: 'text',
}, {
  weights: {
    title: 10,
  },
  name: 'text_search_index'
});


EventSchema.index({ status: 1, startAt: 1 });

export default mongoose.model('Event', EventSchema);
