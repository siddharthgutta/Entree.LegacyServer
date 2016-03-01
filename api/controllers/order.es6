import * as Order from '../order.es6';

export {Status} from '../order.es6';

export function setStatus(id, status) {
  return Order.findOneAndUpdateStatus(id, status);
}


/**
 * Expose model
 */
export {Order as OrderModel};
