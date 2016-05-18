/**
 * Created by jadesym on 5/18/16.
 */
import typeCheck from 'type-check';

export default class TypeChecker {
  constructor() {
    this.typeCheck = typeCheck.typeCheck;
  }

  /**
   * Checks if type string matches given input object
   *
   * @param {String} type: type specification as a string - Ex: String | Number
   * @param {*} input: input object to be compared with type string
   * @returns {Boolean} whether or not type string matches object
   */
  check(type, input) {
    return this.typeCheck(type, input);
  }

  /**
   * Implements OR for the type string format
   *
   * @param {[String]} types: array of type strings
   * @returns {String} string containing each string type in the array joined by ' | '
   */
  or(types) {
    return types.join(' | ');
  }

  /**
   * Implements Tuple for the type string format
   *
   * @param {[String]} types: array of type strings
   * @returns {String} string containing each string type in the array joined by ' , ' and wraps with ()
   */
  tuple(types) {
    return `(${types.join(', ')})`;
  }

  /**
   * Implements Array for the type string format
   *
   * @param {String} type: type string
   * @returns {String} type string as array of given type
   */
  array(type) {
    return `[${type}]`;
  }

  /**
   * Implements Objects for the type string format
   *
   * @param {Object} keysAndTypes: array of required keys for the type string
   * @returns {String} string containing the object type string
   */
  object(keysAndTypes) {
    const keyStringArray = [];
    for (const key in keysAndTypes) { // eslint-disable-line
      keyStringArray.push(`${key}: ${keysAndTypes[key]}`);
    }
    return `{${keyStringArray.join(', ')}}`;
  }
}

const TypeCheck = new TypeChecker();
export default TypeCheck;
