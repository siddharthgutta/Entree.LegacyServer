import mongoose from 'mongoose';

var OrderItemSchema = new mongoose.Schema({
    quantity: Number,
    description: String,
    price: Number
})

var OrderSchema = new mongoose.Schema({
    phoneNumber: String,
    restaurantId: Number,
    items: [OrderItemSchema],
    status: String
});

export {OrderItemSchema, OrderSchema};
