import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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

export default mongoose.model('Order', orderSchema);
