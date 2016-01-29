export default function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    email: DataTypes.STRING(128),
    pin: DataTypes.STRING(4)
  });
  return User;
};