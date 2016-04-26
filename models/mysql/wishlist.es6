export default function (sequelize, DataTypes) {
  const WishList = sequelize.define('WishList', {
    placeId: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: _models => {
        WishList.belongsTo(_models.User, {
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return WishList;
}
