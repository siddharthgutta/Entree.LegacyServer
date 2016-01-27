var mongoose = require("mongoose");

var MenuItemSchema = new mongoose.Schema({
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

var MenuSchema = new mongoose.Schema({
    id: Number,
    menu: [{category: String, menuItems: [MenuItemSchema]}]
});

module.exports = {
    MenuItem: MenuItemSchema,
    Menu: MenuSchema
}
