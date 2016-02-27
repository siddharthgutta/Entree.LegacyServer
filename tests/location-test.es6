import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Location from '../api/location.es6';

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Location', () => {
  const firstAddress = '1234 Main Street';
  const secondAddress = '5678 Burbon Street';
  const city = 'Houston';
  const state = 'TX';
  const zipcode = '48921';

  if (console) {
    console.log('true');
  }

  describe('#create()', () => {
    it('should insert location the database with valid arguments', done => {
      Location.create(firstAddress, city, state, zipcode, {secondAddress})
              .then(location => {
                assert.equal(location.firstAddress, firstAddress);
                assert.equal(location.secondAddress, secondAddress);
                assert.equal(location.city, city);
                assert.equal(location.state, state);
                assert.equal(location.zipcode, zipcode);
                done();
              });
    });

    it('should not create Locations with null firstAddress, null city' +
       'null state, or null zipcode', done => {
      Location.create(null, null, null, null)
              .then(() => {
                assert(false);
                done();
              }, err => {
                assert.equal(err.errors.length, 4);
                done();
              });
    });

    it('should not create Locations with invalid state or zipcode lengths', done => {
      Location.create(firstAddress, city, 'X', '1')
              .then(() => {
                assert(false);
                done();
              }, err => {
                assert.equal(err.errors.length, 2);
                done();
              });
    });
  });
});
