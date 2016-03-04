export default function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING(10), // eslint-disable-line new-cap
      allowNull: false,
      unique: true,
      validate: {
        is: /^\d{10}$/
      }
    },
    firstName: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: true
    },
    lastName: {
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
  }, {
    classMethods: {
      associate: models => {
        User.hasOne(models.ChatState, {
          onDelete: 'CASCADE'
        });

        User.hasMany(models.Order, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return User;
}
