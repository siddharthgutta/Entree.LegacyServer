import * as Restaurant from '../restaurant.es6';

export function setOperation(id, status) {
  Restaurant.findByMode(id, status); // TODO @jesse
}


/**
 * Expose model
 */
export {Restaurant as Model};
