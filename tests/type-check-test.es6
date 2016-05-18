/**
 * Created by jadesym on 5/18/16.
 */

import {TYPES, TypeChecker} from '../libs/type-check/index.es6';
import assert from 'assert';

describe('Type Check', () => {
  const typesArray = [TYPES.BOOLEAN, TYPES.NUMBER, TYPES.STRING];
  const obj = {
    key1: TYPES.BOOLEAN,
    key2: TYPES.NUMBER,
    key3: TYPES.STRING
  };

  function compare(type, input) {
    return TypeChecker.check(type, input);
  }

  describe('#or', () => {
    it('should properly OR on type strings', () => {
      assert.equal(TypeChecker.or(typesArray), `${TYPES.BOOLEAN} | ${TYPES.NUMBER} | ${TYPES.STRING}`);
    });
  });

  describe('#tuple', () => {
    it('should properly wrap type strings in a tuple string', () => {
      assert.equal(TypeChecker.tuple(typesArray), `(${TYPES.BOOLEAN}, ${TYPES.NUMBER}, ${TYPES.STRING})`);
    });
  });

  describe('#array', () => {
    it('should properly wrap type string in brackets', () => {
      assert.equal(TypeChecker.array(TYPES.BOOLEAN), `[${TYPES.BOOLEAN}]`);
    });
  });

  describe('#object', () => {
    it('should properly wrap types and keys in an object type string', () => {
      assert.equal(TypeChecker.object(obj), `{key1: ${TYPES.BOOLEAN}, key2: ${TYPES.NUMBER}, key3: ${TYPES.STRING}}`);
    });
  });

  describe('#check', () => {
    it('should properly check a boolean type', () => {
      assert.ok(compare(TYPES.BOOLEAN, true));
      assert.ok(compare(TYPES.BOOLEAN, false));
      assert.equal(compare(TYPES.BOOLEAN, 'test'), false, 'String should not pass type check for boolean');
      assert.equal(compare(TYPES.BOOLEAN, 1), false, 'Number should not pass type check for boolean');
    });

    it('should properly check a string type', () => {
      assert.ok(compare(TYPES.STRING, 'test'));
      assert.ok(compare(TYPES.STRING, '!@#$'));
      assert.equal(compare(TYPES.BOOLEAN, 'test'), false, 'String should not pass type check for boolean');
      assert.equal(compare(TYPES.BOOLEAN, 1), false);
    });
  });
});
