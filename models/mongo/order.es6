import mongoose from 'mongoose';
import {Status} from '../constants/order.es6';

export {Status};

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
  time: Number,
  message: String,
  status: Object.keys(Status)
});

export default mongoose.model('Order', orderSchema);
