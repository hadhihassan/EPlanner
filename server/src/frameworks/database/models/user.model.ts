import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'organizer', 'participant'], default: 'participant' },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
