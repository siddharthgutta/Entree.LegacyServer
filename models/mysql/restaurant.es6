export default function (sequelize, DataTypes) {
  const Restaurant = sequelize.define('Restaurant', {
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: false,
      primaryKey: true
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
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false
          }
        });

        Restaurant.hasMany(models.RestaurantHours, {
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Restaurant;
}
