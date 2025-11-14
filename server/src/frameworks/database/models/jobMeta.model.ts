import mongoose, { Schema } from 'mongoose';

const JobMetaSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event' }, // Optional for daily digest
  queueName: { type: String, required: true },
  jobId: { type: String, required: true },
  type: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('JobMeta', JobMetaSchema);
