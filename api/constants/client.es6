import keyMirror from 'keymirror';

/**
 * Socket events
 */
// @formatter:off
export const SocketEvents = keyMirror({
  RESTAURANT_STATUS: null,
  NEW_ORDER: null,
  ORDER_UPDATE: null,
  USER_PROFILE_UPDATED: null,
  TEXT_RECEIVED: null,
  TEXT_SENT: null
});
// @formatter:on

import * as OrderConstants from '../../models/constants/order.es6';
export {OrderConstants};

import * as RestaurantConstants from '../../models/constants/restaurant.es6';
export {RestaurantConstants};

export default SocketEvents;
