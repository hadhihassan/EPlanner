import mongoose, { Schema } from 'mongoose';

const JobMetaSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  queueName: { type: String, required: true },
  jobId: { type: String, required: true },
  type: String
}, { timestamps: true });

export default mongoose.model('JobMeta', JobMetaSchema);
