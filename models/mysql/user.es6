export default function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap
      allowNull: false,
      primaryKey: true,
      validate: {
        is: /^\d{10}$/
      }
    },
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(128), // eslint-disable-line new-cap
      allowNull: true,
      validate: {
        isEmail: true
      }
    }
  });
  return User;
}
