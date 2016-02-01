export default function (sequelize, DataTypes) {
  const Restaurant = sequelize.define('Restaurant', {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(10),
      validate: {
        isNumeric: true,
        len: 10
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
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
