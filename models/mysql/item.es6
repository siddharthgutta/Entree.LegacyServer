import {Status} from '../constants/order.es6';

export {Status};

export default function (sequelize, {STRING, FLOAT, BOOLEAN}) {
  const itemSchema = [{
    name: {type: STRING(64), allowNull: true},  // eslint-disable-line new-cap
    description: {type: STRING(64), allowNull: true}, // eslint-disable-line new-cap
    price: {type: FLOAT, allowNull: false},
    canSell: {type: BOOLEAN, defaultValue: true} // unused for now; for translating to SQL
  }, {
    classMethods: {
      associate({Item, Order}) {
        Item.belongsToMany(Order, {through: 'OrderItemAssociation'});
      }
    }
  }];

  return sequelize.define('Item', ...itemSchema);
}
