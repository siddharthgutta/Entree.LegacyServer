import mongoose from 'mongoose';

const {Schema} = mongoose;

const userSecretSchema = new Schema({
  phoneNumber: {
    type: String, // TODO add validation
    unique: true,
    index: true,
    required: true
  },
  createdAt: {type: Date, default: Date.now, expires: '5m'},
  secret: {
    type: Schema.Types.ObjectId,
    unique: true,
    required: true,
    index: true,
    default: mongoose.Types.ObjectId
  }
});

export default mongoose.model('UserSecret', userSecretSchema);
