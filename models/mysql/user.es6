export default function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      validate: {
        len: 10,
        isNumeric: true
      }
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: true,
      validate: {
        is: /^[a-zA-Z ]*$/
      }
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: true,
      validate: {
        isEmail: true
      }
    }
  });
  return User;
};
