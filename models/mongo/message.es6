import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    match: /^\d{10}$/
  },
  restaurantId: Number,
  content: String,
  date: Date,
  twilioSid: String,
  twilioNumber: String,
  sentByUser: Boolean,
  success: Boolean
});

export default mongoose.model('Message', messageSchema);
