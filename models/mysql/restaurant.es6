import {Mode} from '../constants/restaurant.es6';

export {Mode};

export default function (sequelize, DataTypes) {
  const Restaurant = sequelize.define('Restaurant', {
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap
      validate: {
        isNumeric: true,
        len: 10
      }
    },
    mode: {
      type: DataTypes.ENUM(...Object.keys(Mode)), // eslint-disable-line new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: models => {
        Restaurant.hasOne(models.Location, {
          onDelete: 'CASCADE'
        });

        Restaurant.hasMany(models.RestaurantHour, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return Restaurant;
}
