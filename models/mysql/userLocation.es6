export default function (sequelize, DataTypes) {
  const UserLocation = sequelize.define('UserLocation', {
    latitude: {
      type: DataTypes.DOUBLE, // eslint-disable-line new-cap
      allowNull: false
    },
    longitude: {
      type: DataTypes.DOUBLE, // eslint-disable-line new-cap
      allowNull: false
    },
    default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: _models => {
        UserLocation.belongsTo(_models.User, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return UserLocation;
}
