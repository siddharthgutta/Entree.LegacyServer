var mongoose = require('mongoose')

var OrderItemSchema = new mongoose.Schema({
    quantity: Number,
    description: String,
    price: Number
})

var OrderSchema = new mongoose.Schema({
    phoneNumber: String,
    restaurantId: Number,
    items: [OrderItemSchema],
    totalPrice: Number,
    state: String
});

module.exports = {
    OrderItem: OrderItemSchema,
    Order: OrderSchema
}
