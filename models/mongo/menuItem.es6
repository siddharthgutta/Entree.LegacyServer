import mongoose from 'mongoose';

const menuItemCategories = {entree: 'Entree', drink: 'Drink'};

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sizes: {
    small: Number,
    medium: Number,
    large: Number
  },
  mods: [{mod: String, price: Number}]
});

export {menuItemCategories};

export default mongoose.model('MenuItem', menuItemSchema);
