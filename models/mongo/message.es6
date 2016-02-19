import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    match: /^\d{10}$/,
    required: true
  },
  restaurantId: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  twilioSid: {
    type: String,
    required: true
  },
  twilioNumber: {
    type: String,
    required: true
  },
  sentByUser: {
    type: Boolean,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  }
});

export default mongoose.model('Message', messageSchema);
