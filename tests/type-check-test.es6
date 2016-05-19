/**
 * Created by jadesym on 5/18/16.
 */

import {TYPES, TypeChecker} from '../libs/type-check/index.es6';
import assert from 'assert';

describe('Type Check', () => {
  const testObjects = {
    [TYPES.STRING]: {
      valid: ['test', '!@#$']
    },
    [TYPES.NUMBER]: {
      valid: [1, 2.5, 49506845697]
    },
    [TYPES.BOOLEAN]: {
      valid: [true, false]
    },
    [TYPES.ERROR]: {
      valid: [new Error('WTF'), new Error('BBQ')]
    },
    [TYPES.UNDEFINED]: {
      valid: [undefined]
    },
    [TYPES.ARRAY]: {
      valid: [[1, 'yolo', true], [2.5, 'asjkdf', new Error()]]
    },
    [TYPES.FUNCTION]: {
      valid: [x => x, (a, b) => a + b]
    },
    [TYPES.NULL]: {
      valid: null
    }
  };

  function compare(type, input) {
    return TypeChecker.check(type, input);
  }

  function testTypes(inputType) {
    for (const objType in testObjects) { // eslint-disable-line
      const objects = testObjects[objType].valid;
      for (const idx in objects) { // eslint-disable-line
        const curObj = objects[idx];
        if (objType === inputType) {
          assert.ok(compare(inputType, curObj), `The \'${curObj}\' object should pass type check for ${objType}`);
        } else {
          assert.equal(compare(inputType, curObj), false, `The \'${curObj}\' (${inputType}) object should ` +
            `fail type check for ${objType}`);
        }
      }
    }
  }

  const typesArray = [TYPES.BOOLEAN, TYPES.NUMBER, TYPES.STRING];
  const obj = {
    key1: TYPES.BOOLEAN,
    key2: TYPES.NUMBER,
    key3: TYPES.STRING
  };

  const compositeTypeObjects = {
    or: {
      msg: 'should properly OR on type strings',
      input: [TYPES.BOOLEAN, TYPES.NUMBER, TYPES.STRING],
      func: TypeChecker.or,
      typeString: `${TYPES.BOOLEAN} | ${TYPES.NUMBER} | ${TYPES.STRING}`,
      valid: [true, 1.5, 'test'],
      invalid: [undefined, null, new Error('test error'), [1, 2, 3], x => x]
    },
    tuple: {
      msg: 'should properly wrap type strings in a tuple string',
      input: [TYPES.BOOLEAN, TYPES.NUMBER, TYPES.STRING],
      func: TypeChecker.tuple,
      typeString: `(${TYPES.BOOLEAN}, ${TYPES.NUMBER}, ${TYPES.STRING})`,
      valid: [[true, 1.5, 'test'], [false, -2, '!@#$']],
      invalid: [[true, 1.5], [true, 1.5, new Error('fail'), [false, 2.5, 'test', 'yo']]]
    },
    array: {
      msg: 'should properly wrap type string in brackets',
      input: TYPES.BOOLEAN,
      func: TypeChecker.array,
      typeString: `[${TYPES.BOOLEAN}]`,
      valid: [[true, false], [false, true, false], []],
      invalid: [[true, false, 'fail'], [new Error('fail'), undefined, null, true]]
    },
    object: {
      msg: 'should properly wrap types and keys in an object type string',
      input: {
        key1: TYPES.BOOLEAN, key2: TYPES.NUMBER, key3: TYPES.STRING
      },
      func: TypeChecker.object,
      typeString: `{key1: ${TYPES.BOOLEAN}, key2: ${TYPES.NUMBER}, key3: ${TYPES.STRING}}`,
      valid: [{key1: true, key2: 1.5, key3: 'test'}, {key1: false, key2: -2, key3: '!@#$'}],
      invalid: [{key: true, key2: 1.5, key3: 'test'}, {key1: false, key2: 1.5, key3: undefined},
                {key1: true, key2: 1.5, key3: 'test', badKey: 'badKey'},
                {key1: true, key2: 1.5}]
    }
  };

  function testCompositeTypes(inputCompositeType) {
    const {typeString, valid, invalid} = compositeTypeObjects[inputCompositeType];

    for (const idx in valid) { // eslint-disable-line
      const curObj = valid[idx];
      assert.ok(compare(typeString, curObj), `The \'${curObj}\' object should pass type check ` +
        `for ${typeString}`);
    }

    for (const idx in invalid) { // eslint-disable-line
      const curObj = invalid[idx];
      assert.equal(compare(typeString, curObj), false, `The \'${curObj}\' (${inputCompositeType}) object ` +
        `should fail type check for ${typeString}`);
    }
  }

  Object.keys(compositeTypeObjects).forEach(compositeType => {
    describe(`#${compositeType}`, () => {
      const current = compositeTypeObjects[compositeType];
      it(current.msg, () => {
        assert.equal(current.func(current.input), current.typeString);
      });

      it(`should properly check the composite type for ${compositeType}`, () => {
        testCompositeTypes(compositeType);
      });
    });
  });

  describe('#check', () => {
    Object.keys(testObjects).forEach(keyType => {
      it(`should properly check a single type: ${keyType}`, () => {
        testTypes(keyType);
      });
    });
  });
});
