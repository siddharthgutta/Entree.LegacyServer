export default function(sequelize, DataTypes) {
  var RestaurantHours = sequelize.define('RestaurantHours', {
    dayOfTheWeek: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    openTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    closeTime: {
      type: DataTypes.TIME,
      allowNull: false
    }
  });
  return RestaurantHours;
};