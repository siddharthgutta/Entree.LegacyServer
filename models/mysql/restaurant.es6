export default function(sequelize, DataTypes) {
  var Restaurant = sequelize.define('Restaurant', {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    phoneNumber: DataTypes.STRING(10)
  }, {
    classMethods: {
      associate: function(models) {
        Restaurant.hasOne(models.Location, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });

        Restaurant.hasMany(models.RestaurantHours, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Restaurant;
};