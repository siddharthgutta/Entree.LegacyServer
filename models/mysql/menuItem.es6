import models from './index.es6';
import Promise from 'bluebird';

export default function (sequelize, DataTypes) {
  const MenuItem = sequelize.define('MenuItem', {
    name: {
      type: DataTypes.STRING(32), // eslint-disable-line new-cap,babel/new-cap
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

        // @jlmao is this supposed to be here?
        MenuItem.hasMany(db.Size, {
          onDelete: 'CASCADE'
        });

        MenuItem.hasMany(db.ItemMod, {
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      upsertItemMod: async function (name, min, max) { // eslint-disable-line
        // TODO add error logging later @jlmao
        const itemMods = await this.getItemMods({where: {name}});

        /* Since we are finding mods by name, length of itemMods should only be max 1
        *   (e.g.) there should not be multiple 'Extra Cheese' mods per menuItem */
        await Promise.map(itemMods, async itemMod => await itemMod.destroy());

        const newItemMod = await models.ItemMod.create({name, min, max});
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
