export default function (sequelize, DataTypes) {
  const RestaurantHour = sequelize.define('RestaurantHour', {
    dayOfTheWeek: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap
      allowNull: false,
      validate: {
        isIn: [[
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
          'Custom'
        ]]
      }
    },
    // TODO add openDate
    // TODO add closeDate
    openTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: /^[0-9]{2}\:[0-9]{2}\:[0-9]{2}$/
      }
    },
    closeTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: /^[0-9]{2}\:[0-9]{2}\:[0-9]{2}$/,
        validTimes: function (closeTime) { // eslint-disable-line
          if (closeTime <= this.openTime) {
            throw new Error('Close time must be after openTime');
          }
        }
      }
    }
  }, {
    classMethods: {
      associate: db => {
        RestaurantHour.belongsTo(db.Restaurant, {
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return RestaurantHour;
}
