import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  content: String,
  date: Date,
  twilioSid: String
});

export default mongoose.model('Message', messageSchema);
