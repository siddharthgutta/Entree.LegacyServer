import {Mode} from '../constants/restaurant.es6';
export {Mode};
import models from './index.es6';
import Promise from 'bluebird';

export default function (sequelize, DataTypes) {
  const Restaurant = sequelize.define('Restaurant', {
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap,babel/new-cap
      unique: true,
      allowNull: false
    },
    handle: {
      type: DataTypes.STRING(25), // eslint-disable-line new-cap,babel/new-cap
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap,babel/new-cap
      validate: {
        isNumeric: true,
        len: 10
      }
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    deleted: { // soft delete
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mode: {
      type: DataTypes.ENUM(...Object.keys(Mode)), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    merchantId: {
      type: DataTypes.STRING(32), // eslint-disable-line new-cap
      allowNull: true,
      unique: true,
      validate: {
        len: [1, 32]
      }
    },
    merchantApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    percentageFee: {
      type: DataTypes.DECIMAL(5, 2), // eslint-disable-line new-cap
      allowNull: true,
      validate: {
        isDecimal: true,
        max: 100,
        min: 0
      }
    },
    transactionFee: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
        min: 0
      }
    }
  }, {
    classMethods: {
      associate: db => {
        Restaurant.hasOne(db.Location, {
          onDelete: 'CASCADE'
        });

        Restaurant.hasMany(db.Category, {
          onDelete: 'CASCADE'
        });

        Restaurant.hasMany(db.Order, {
          onDelete: 'CASCADE'
        });

        Restaurant.hasMany(db.RestaurantHour, {
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      insertCategory: async function (name) { // eslint-disable-line
        const categories = await this.getCategories({where: {name}});
        if (categories.length >= 1) {
          throw (Error(`Tried to add a category ${name} to restaurant id ${this.id} that already exists`));
        }

        const newCategory = await models.Category.create({name});
        await this.addCategory(newCategory);
        return newCategory;
      },
      findCategories: async function () { // eslint-disable-line
        return await this.getCategories();
      },
      upsertLocation: async function (address, city, state, zipcode) { // eslint-disable-line
        const oldLocation = await this.getLocation();
        if (oldLocation) {
          oldLocation.destroy();
        }

        const newLocation = await models.Location.create({address, city, state, zipcode});
        await this.setLocation(newLocation);
        return newLocation;
      },
      findLocation: async function () { // eslint-disable-line
        return await this.getLocation();
      },
      addHour: async function (dayOfTheWeek, openTime, closeTime) { // eslint-disable-line
        /* TODO - Add checking for case of overlapping restaurant hours */

        const newHour = await models.RestaurantHour.create({dayOfTheWeek, openTime, closeTime});
        await this.addRestaurantHour(newHour);
        return newHour;
      },
      removeHours: async function (dayOfTheWeek) { // eslint-disable-line
        const hours = await this.getRestaurantHours({where: {dayOfTheWeek}});

        await Promise.map(hours, async hour => {
          await hour.destroy();
        });
      },
      findHours: async function () { // eslint-disable-line
        return await this.getRestaurantHours();
      }
    }
  });

  return Restaurant;
}
