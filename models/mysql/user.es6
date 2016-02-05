export default function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap
      allowNull: false,
      primaryKey: true,
      validate: {
        len: 10,
        isNumeric: true
      }
    },
    password: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: true,
      validate: {
        is: /^[a-zA-Z ]*$/
      }
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
