export default function (sequelize, DataTypes) {
  const OrderItem = sequelize.define('OrderItem', {
    name: {
      type: DataTypes.STRING(64), // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER, // eslint-disable-line new-cap,babel/new-cap
      allowNull: false
    }
  }, {
    classMethods: {
      associate: db => {
        OrderItem.belongsTo(db.ChatState, {
          onDelete: 'CASCADE'
        });
      }
    }
  });
  return OrderItem;
}
