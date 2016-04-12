import mongoose from 'mongoose';

const {Schema} = mongoose;

const userSecretSchema = new Schema({
  userId: {
    type: String, // TODO add validation
    index: true,
    required: true
  },
  createdAt: {type: Date, default: Date.now, expires: 60 * 60},
  secret: {
    type: Schema.Types.ObjectId,
    unique: true,
    required: true,
    index: true,
    default: mongoose.Types.ObjectId
  }
});

export default mongoose.model('UserSecret', userSecretSchema);
