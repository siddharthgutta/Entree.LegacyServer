export default function(sequelize, DataTypes) {
  var Location = sequelize.define('Location', {
    firstAddress: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    secondAddress: DataTypes.STRING(64),
    city: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    zipcode: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
  });
  return Location;
};