import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';
import * as Location from '../api/location.es6';

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Location', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const address = '1234 Main Street';
  const city = 'Houston';
  const state = 'TX';
  const zipcode = '48921';

  if (console) {
    console.log('true');
  }

  describe('#upsertLocation()', () => {
    it('should set the location of a restaurant if one does not exist', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.upsertLocation(address, city, state, zipcode))
        .then(result => {
          assert.equal(result.address, address);
          assert.equal(result.city, city);
          assert.equal(result.state, state);
          assert.equal(result.zipcode, zipcode);
          done();
        });
    });

    it('should replace an existing location correctly', done => {
      let restaurant;
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(_restaurant => restaurant = _restaurant)
        .then(() => restaurant.upsertLocation(address, city, state, zipcode))
        .then(() => restaurant.upsertLocation('Main St', 'NewCity', 'AB', '09876'))
        .then(() => restaurant.findLocation())
        .then(result => {
          assert.equal(result.address, 'Main St');
          assert.equal(result.city, 'NewCity');
          assert.equal(result.state, 'AB');
          assert.equal(result.zipcode, '09876');
          done();
        });
    });

    it('should delete the old location when replacing', done => {
      let restaurant;
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(_restaurant => restaurant = _restaurant)
        .then(() => restaurant.upsertLocation(address, city, state, zipcode))
        .then(() => restaurant.upsertLocation('Main St', 'NewCity', 'AB', '09876'))
        .then(() => Location.findAll())
        .then(result => {
          assert.equal(result.length, 1);
          done();
        });
    });

    it('should not set a location with null address', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.upsertLocation(null, city, state, zipcode))
        .then(() => {
          assert(false);
          done();
        })
        .catch(() => {
          assert(true);
          done();
        });
    });

    it('should not set a location with null city', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.upsertLocation(address, null, state, zipcode))
        .then(() => {
          assert(false);
          done();
        })
        .catch(() => {
          assert(true);
          done();
        });
    });

    it('should not set a location with null state', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.upsertLocation(address, city, null, zipcode))
        .then(() => {
          assert(false);
          done();
        })
        .catch(() => {
          assert(true);
          done();
        });
    });

    it('should not set a location with null zipcode', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.upsertLocation(address, city, state, null))
        .then(() => {
          assert(false);
          done();
        })
        .catch(() => {
          assert(true);
          done();
        });
    });

    it('should not set a location with state code of length other than 2', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.upsertLocation(address, city, 'A', zipcode))
        .then(() => {
          assert(false);
          done();
        })
        .catch(() => {
          assert(true);
          done();
        });
    });

    it('should not set a location with zipcode of length other than 5', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.upsertLocation(address, city, state, '1234'))
        .then(() => {
          assert(false);
          done();
        })
        .catch(() => {
          assert(true);
          done();
        });
    });
  });

  describe('#findLocation()', () => {
    it('should find the location if there is one set', done => {
      let restaurant;
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(_restaurant => restaurant = _restaurant)
        .then(() => restaurant.upsertLocation(address, city, state, zipcode))
        .then(() => restaurant.findLocation())
        .then(result => {
          assert.equal(result.address, address);
          assert.equal(result.city, city);
          assert.equal(result.state, state);
          assert.equal(result.zipcode, zipcode);
          done();
        });
    });

    it('should return null if none is set', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.findLocation())
        .then(result => {
          assert.equal(result, null);
          done();
        });
    });
  });
});
