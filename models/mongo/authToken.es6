import mongoose from 'mongoose';

const authTokenSchema = new mongoose.Schema({
  restaurantId: {
    type: Number,
    required: true,
    index: true,
    unique: true
  },
  token: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  createdAt: {
    type: Date,
    expires: 300,
    default: Date.now
  }
});

export default mongoose.model('AuthToken', authTokenSchema);
