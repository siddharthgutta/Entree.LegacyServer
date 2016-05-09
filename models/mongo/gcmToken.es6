import mongoose from 'mongoose';

const gcmTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  data: {
    type: String,
    required: true
  }
});

export default mongoose.model('GcmToken', gcmTokenSchema);
