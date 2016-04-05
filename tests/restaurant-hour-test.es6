import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Restaurant', () => {
  const name = 'TestRestaurant';
  const handle = 'testrestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';
  const mode = Restaurant.Mode.REGULAR;

  const dayOfTheWeek = 'Monday';
  const openTime = '11:11:11';
  const closeTime = '12:34:56';

  if (console) {
    console.log('true');
  }

  describe('#addHours()', () => {
    it('should add and query restaurant hours for a restaurant correctly', async () => {
      const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
      const hour = await restaurant.addHour(dayOfTheWeek, openTime, closeTime);

      assert.equal(hour.dayOfTheWeek, dayOfTheWeek);
      assert.equal(hour.openTime, openTime);
      assert.equal(hour.closeTime, closeTime);
    });

    it('should support multiple days of the week', async () => {
      const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
      await restaurant.addHour(dayOfTheWeek, openTime, closeTime);
      await restaurant.addHour('Tuesday', openTime, closeTime);

      const hours = await restaurant.findHours();
      assert.equal(hours.length, 2);
    });

    it('should not create a restaurant hour with null day of the week', async done => {
      const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
      try {
        await restaurant.addHour(null, openTime, closeTime);
      } catch (error) {
        return done();
      }

      assert(false);
      done();
    });
  });

  describe('#removeHours()', () => {
    it('should remove restaurant hours correctly', async done => {
      const restaurant = (await Restaurant.create(name, handle, password, mode, {phoneNumber})).resolve();
      await restaurant.addHour(dayOfTheWeek, openTime, closeTime);
      let result = await restaurant.findHours();
      assert.equal(result.length, 1);

      await restaurant.removeHours(dayOfTheWeek);
      result = await restaurant.findHours();
      assert.equal(result.length, 0);

      done();
    });
  });
});
