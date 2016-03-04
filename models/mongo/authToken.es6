import mongoose from 'mongoose';

const authTokenSchema = new mongoose.Schema({
  restaurantId: {
    type: Number,
    required: true,
    index: true,
    unique: false
  },
  token: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  createdAt: {
    type: Date,
    expires: 60 * 60 * 2, // 120 minutes
    default: Date.now
  }
});

export default mongoose.model('AuthToken', authTokenSchema);
