import EventEmitter from 'events';

/**
 * One global dispatcher from now; in the future it could change
 */
export default new EventEmitter();

export {default as Events} from '../constants/internal.es6';
