/**
 * Created by kfu on 3/14/16.
 */

export default function (sequelize, DataTypes) {
  const Mod = sequelize.define('Mod', {
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    addPrice: {
      type: DataTypes.INTEGER, // eslint-disable-line new-cap,babel/new-cap
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    instanceMethods: {
      findItemMod: async function () { // eslint-disable-line
        return await this.getItemMod();
      }
    },
    classMethods: {
      associate: db => {
        Mod.belongsTo(db.ItemMod, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return Mod;
}
