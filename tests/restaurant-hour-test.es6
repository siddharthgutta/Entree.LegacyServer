import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Restaurant', () => {
  const name = 'TestRestaurant';
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
    it('should add and query restaurant hours for a restaurant correctly', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.addHour(dayOfTheWeek, openTime, closeTime))
        .then(hour => {
          assert.equal(hour.dayOfTheWeek, dayOfTheWeek);
          assert.equal(hour.openTime, openTime);
          assert.equal(hour.closeTime, closeTime);
          done();
        });
    });

    it('should support multiple days of the week', done => {
      let restaurant;
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(_restaurant => restaurant = _restaurant)
        .then(() => restaurant.addHour(dayOfTheWeek, openTime, closeTime))
        .then(() => restaurant.addHour('Tuesday', openTime, closeTime))
        .then(() => restaurant.findHours())
        .then(hours => {
          assert.equal(hours.length, 2);
          done();
        });
    });

    it('should not create a restaurant hour with null day of the week', async done => {
      const restaurant = await Restaurant.create(name, password, mode, {phoneNumber});
      try {
        await restaurant.addHour(null, openTime, closeTime);
      } catch (error) {
        return done();
      }

      assert(false);
      done();
    });
  });
});
