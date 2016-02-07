import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
    match: /^\d{10}$/
  },
  to: {
    type: String,
    match: /^\d{10}$/
  },
  content: String,
  date: Date,
  twilioSid: String,
  success: Boolean
});

export default mongoose.model('Message', messageSchema);
