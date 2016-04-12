import models from './index.es6';
import _ from 'underscore';

export default function (sequelize, DataTypes) {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: db => {
        Category.belongsTo(db.Restaurant, {
          onDelete: 'CASCADE'
        });

        Category.hasMany(db.MenuItem, {
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      findMenuItems: async function () { // eslint-disable-line
        return await this.getMenuItems();
      },
      findMenuItemByName: async function (name) { // eslint-disable-line
        const menuItems = await this.getMenuItems({where: {name}});
        return _.first(menuItems);
      },
      insertMenuItem: async function (name, description, basePrice) { // eslint-disable-line
        const menuItem = await models.MenuItem.create({name, description, basePrice});
        await this.addMenuItem(menuItem);
        return menuItem;
      }
    }
  });
  return Category;
}
