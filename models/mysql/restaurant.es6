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
