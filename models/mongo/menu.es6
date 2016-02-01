import mongoose from 'mongoose';

export default new mongoose.Schema({
  id: Number,
  menu: [
    {
      category: String,
      menuItems: {
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
      }
    }
  ]
});
