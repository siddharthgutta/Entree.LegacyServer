import models from './index.es6';
import Promise from 'bluebird';
import _ from 'underscore';

export default function (sequelize, DataTypes) {
  const ItemMod = sequelize.define('ItemMod', {
    name: {
      type: DataTypes.STRING(32), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    min: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    max: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        validMinMax: function (max) {  // eslint-disable-line
          if (max < this.min) {
            throw new Error('Max number of choices must be >= min number of choices');
          }
        }
      }
    }
  }, {
    classMethods: {
      associate: db => {
        ItemMod.belongsTo(db.MenuItem, {
          onDelete: 'CASCADE'
        });

        ItemMod.hasMany(db.Mod, {
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      upsertMod: async function (name, addPrice) { // eslint-disable-line
        // TODO add error logging later @jlmao
        const mods = await this.getMods({where: {name}});

        await Promise.map(mods, async mod => await mod.destroy());

        const newMod = await models.Mod.create({name, addPrice});
        await this.addMod(newMod);
        return newMod;
      },
      updateFields: async function (min, max) { // eslint-disable-line
        await this.update({min, max});
      },
      findModByName: async function (name) { // eslint-disable-line
        const mods = await this.getMods({where: {name}});
        return _.first(mods);
      },
      findMods: async function() { // eslint-disable-line
        return await this.getMods();
      }
    }
  });

  return ItemMod;
}
