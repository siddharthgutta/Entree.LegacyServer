export default function (sequelize, DataTypes) {
  const Location = sequelize.define('Location', {
    firstAddress: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(32), // eslint-disable-line new-cap
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(2), // eslint-disable-line new-cap
      allowNull: false,
      validate: {
        len: 2
      }
    },
    zipcode: {
      type: DataTypes.STRING(5), // eslint-disable-line new-cap
      allowNull: false,
      validate: {
        len: 5
      }
    },
    secondAddress: DataTypes.STRING(64) // eslint-disable-line new-cap
  }, {
    classMethods: {
      associate: models => {
        Location.belongsTo(models.Restaurant);
      }
    }
  });
  return Location;
}
