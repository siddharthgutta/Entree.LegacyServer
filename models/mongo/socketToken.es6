import mongoose from 'mongoose';

const socketTokenSchema = new mongoose.Schema({
  restaurantId: {
    type: Number,
    unique: true,
    index: true,
    required: true
  },
  numTokens: {
    type: Number,
    required: true
  },
  tokens: [String]
});

export default mongoose.model('SocketToken', socketTokenSchema);
