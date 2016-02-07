import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
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

export default mongoose.model('Menu', menuSchema);
