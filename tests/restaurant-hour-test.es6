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

  describe('#addOrUpdateHours()', () => {
    it('should add and query restaurant hours for a restaurant correctly', done => {
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(restaurant => restaurant.addOrUpdateHour(dayOfTheWeek, openTime, closeTime))
        .then(hour => {
          assert.equal(hour.dayOfTheWeek, dayOfTheWeek);
          assert.equal(hour.openTime, openTime);
          assert.equal(hour.closeTime, closeTime);
          done();
        });
    });

    it('should update and query restaurant hours for a restaurant correctly', done => {
      let restaurant;
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(_restaurant => restaurant = _restaurant)
        .then(() => restaurant.addOrUpdateHour(dayOfTheWeek, openTime, closeTime))
        .then(() => restaurant.addOrUpdateHour(dayOfTheWeek, '22:22:22', '33:33:33'))
        .then(() => restaurant.findHours())
        .then(hours => {
          assert.equal(hours.length, 1);
          assert.equal(hours[0].dayOfTheWeek, dayOfTheWeek);
          assert.equal(hours[0].openTime, '22:22:22');
          assert.equal(hours[0].closeTime, '33:33:33');
          done();
        });
    });

    it('should support multiple days of the week', done => {
      let restaurant;
      Restaurant.create(name, password, mode, {phoneNumber})
        .then(_restaurant => restaurant = _restaurant)
        .then(() => restaurant.addOrUpdateHour(dayOfTheWeek, openTime, closeTime))
        .then(() => restaurant.addOrUpdateHour('Tuesday', openTime, closeTime))
        .then(() => restaurant.findHours())
        .then(hours => {
          assert.equal(hours.length, 2);
          done();
        });
    });

    it('should not create a restaurant hour with null day of the week', async done => {
      const restaurant = await Restaurant.create(name, password, mode, {phoneNumber});
      try {
        await restaurant.addOrUpdateHour(null, openTime, closeTime);
      } catch (error) {
        return done();
      }

      assert(false);
      done();
    });
  });
});
