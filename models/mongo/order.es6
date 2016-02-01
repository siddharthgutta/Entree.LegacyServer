import mongoose from 'mongoose';

export default new mongoose.Schema({
  phoneNumber: String,
  restaurantId: Number,
  items: [
    {
      quantity: Number,
      description: String,
      price: Number
    }
  ],
  status: String
});
