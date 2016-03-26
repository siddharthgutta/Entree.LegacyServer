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

  let restaurant;
  beforeEach(async () => {
    restaurant = (await Restaurant.create(name, password, mode, {phoneNumber})).resolve();
  });

  describe('#upsertLocation()', () => {
    it('should set the location of a restaurant if one does not exist', async () => {
      const result = await restaurant.upsertLocation(address, city, state, zipcode);
      assert.equal(result.address, address);
      assert.equal(result.city, city);
      assert.equal(result.state, state);
      assert.equal(result.zipcode, zipcode);
    });

    it('should replace an existing location correctly', async () => {
      await restaurant.upsertLocation(address, city, state, zipcode);
      await restaurant.upsertLocation('Main St', 'NewCity', 'AB', '09876');
      const result = await restaurant.findLocation();

      assert.equal(result.address, 'Main St');
      assert.equal(result.city, 'NewCity');
      assert.equal(result.state, 'AB');
      assert.equal(result.zipcode, '09876');
    });

    it('should delete the old location when replacing', async () => {
      await restaurant.upsertLocation(address, city, state, zipcode);
      await restaurant.upsertLocation('Main St', 'NewCity', 'AB', '09876');
      const result = await Location.findAll();
      assert.equal(result.length, 1);
    });

    it('should not set a location with null address', async () => {
      try {
        await restaurant.upsertLocation(null, city, state, zipcode);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should not set a location with null city', async () => {
      try {
        await restaurant.upsertLocation(address, null, state, zipcode);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should not set a location with null state', async () => {
      try {
        await restaurant.upsertLocation(address, city, null, zipcode);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should not set a location with null zipcode', async () => {
      try {
        await restaurant.upsertLocation(address, city, state, null);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should not set a location with state code of length other than 2', async () => {
      try {
        await restaurant.upsertLocation(address, city, 'A', zipcode);
      } catch (err) {
        return;
      }

      assert(false);
    });

    it('should not set a location with zipcode of length other than 5', async () => {
      try {
        await restaurant.upsertLocation(address, city, state, '1234');
      } catch (err) {
        return;
      }

      assert(false);
    });
  });

  describe('#findLocation()', () => {
    it('should find the location if there is one set', async () => {
      await restaurant.upsertLocation(address, city, state, zipcode);
      const result = await restaurant.findLocation();
      assert.equal(result.address, address);
      assert.equal(result.city, city);
      assert.equal(result.state, state);
      assert.equal(result.zipcode, zipcode);
    });

    it('should return null if none is set', async () => {
      const result = await restaurant.findLocation();
      assert.equal(result, null);
    });
  });
});
