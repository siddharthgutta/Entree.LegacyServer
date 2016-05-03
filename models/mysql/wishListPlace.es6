export default function (sequelize, DataTypes) {
  const WishListPlace = sequelize.define('WishListPlace', {
    placeId: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: _models => {
        WishListPlace.belongsTo(_models.User, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return WishListPlace;
}
