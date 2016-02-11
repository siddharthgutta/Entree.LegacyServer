import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  restaurantId: Number,
  category: String,
  name: String,
  description: String,
  price: Number,
  hasSize: Boolean,
  sizes: {
    small: Number,
    medium: Number,
    large: Number
  },
  mods: [{mod: String, price: Number}]
});

export default mongoose.model('MenuItem', menuItemSchema);
