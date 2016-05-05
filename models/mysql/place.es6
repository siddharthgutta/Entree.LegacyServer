export default function (sequelize, DataTypes) {
  const Place = sequelize.define('Place', {
    placeId: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: _models => {
        Place.belongsTo(_models.User, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return Place;
}
