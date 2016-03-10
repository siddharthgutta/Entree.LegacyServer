import {Status} from '../constants/order.es6';

export {Status};

export default function (sequelize, {ENUM, INTEGER, STRING}) {
  const orderSchema = [{
    status: {type: ENUM(...Object.keys(Status)), allowNull: false}, // eslint-disable-line new-cap
    prepTime: {type: INTEGER, allowNull: true},
    message: {type: STRING(64), allowNull: true} // eslint-disable-line new-cap
  }, {
    classMethods: {
      associate({Order, User, Restaurant, Item}) {
        Order.belongsTo(User, {onDelete: 'SET NULL'});
        Order.belongsTo(Restaurant, {onDelete: 'CASCADE'});
        Order.belongsToMany(Item, {through: 'OrderItemAssociation'});
      }
    }
  }];

  return sequelize.define('Order', ...orderSchema);
}
