import _ from 'underscore';
import models from './index.es6';

export default function (sequelize, DataTypes) {
  const MenuItem = sequelize.define('MenuItem', {
    name: {
      type: DataTypes.STRING(16), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    basePrice: {
      type: DataTypes.INTEGER, // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: db => {
        MenuItem.belongsTo(db.Category, {
          onDelete: 'CASCADE'
        });

        MenuItem.hasMany(db.Size, {
          onDelete: 'CASCADE'
        });

        MenuItem.hasMany(db.ItemMod, {
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      upsertSize: async function (name, addPrice) { // eslint-disable-line
        const oldSizes = await this.getSizes({where: {name}});

        /* Since we are finding sizes by name length of oldSizes should only be max 1
        *   (e.g.) there should not be multiple 'Large' sizes per menuItem */
        _.each(oldSizes, async size => await size.destroy());

        const newSize = await models.Size.create({name, addPrice});
        await this.addSize(newSize);
        return newSize;
      },
      findSizes: async function () { // eslint-disable-line
        return await this.getSizes();
      },
      upsertItemMod: async function (name, addPrice) { // eslint-disable-line
        const itemMods = await this.getItemMods({where: {name}});

        /* Since we are finding mods by name, length of itemMods should only be max 1
        *   (e.g.) there should not be multiple 'Extra Cheese' mods per menuItem */
        _.each(itemMods, async itemMod => await itemMod.destroy());

        const newItemMod = await models.ItemMod.create({name, addPrice});
        await this.addItemMod(newItemMod);
        return newItemMod;
      },
      findItemMods: async function () { // eslint-disable-line
        return await this.getItemMods();
      }
    }
  });

  return MenuItem;
}
