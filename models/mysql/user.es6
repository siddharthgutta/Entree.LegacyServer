export default function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING(12),
      allowNull: false,
      primaryKey: true,
      validate: {
        len: 12
      }
    },
    pin: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        isNumeric: true,
        len: 4
      }
    },
    name: {
      type: DataTypes.STRING(64),
      validate: {
        is: /^[a-zA-Z ]*$/
      }
    },
    email: {
      type: DataTypes.STRING(128),
      validate: {
        isEmail: true
      }
    }
  });
  return User;
};
