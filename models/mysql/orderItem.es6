export default function (sequelize, DataTypes) {
  const OrderItem = sequelize.define('OrderItem', {
    name: {
      type: DataTypes.STRING(16), // eslint-disable-line new-cap
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER, // eslint-disable-line new-cap
      allowNull: false
    },
    mods: {
      type: DataTypes.STRING(128), // eslint-disable-line new-cap
      allowNull: true
    }
  }, {
    classMethods: {
      associate: models => {
        OrderItem.belongsTo(models.ChatState);
      }
    }
  });
  return OrderItem;
}
