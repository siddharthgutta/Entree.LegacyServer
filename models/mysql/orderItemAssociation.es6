import {Status} from '../constants/order.es6';

export {Status};

export default function (sequelize) {
  const orderItemAssociationSchema = [{}];

  return sequelize.define('OrderItemAssociation', ...orderItemAssociationSchema);
}
