import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as RestaurantHour from '../api/restaurantHour.es6';

beforeEach(done => {
  clearDatabase()
  .then(() => done());
});

after(() => disconnectDatabase());

describe('RestaurantHour', () => {
  const dayOfTheWeek = 'Monday';
  const openTime = '11:11:11';
  const closeTime = '12:34:56';

  if (console) {
    console.log('true');
  }

  describe('#create()', () => {
    it('should insert and query to the database with valid arguments', done => {
      RestaurantHour.create(dayOfTheWeek, openTime, closeTime)
                    .then(result => {
                      assert.equal(result.dayOfTheWeek, dayOfTheWeek);
                      assert.equal(result.openTime, openTime);
                      assert.equal(result.closeTime, closeTime);
                      done();
                    });
    });

    it('should not create RestaurantHours that have a invalid close and open time' +
       'formats', done => {
      RestaurantHour.create(dayOfTheWeek, '00:00', '11:22')
                    .then(() => {
                      assert(false);
                      done();
                    }, err => {
                      assert.equal(err.errors.length, 2);
                      done();
                    });
    });

    it('should not create RestaurantHours that have a invalid close and open time' +
       'formats', done => {
      RestaurantHour.create(dayOfTheWeek, '0:0:0', '1:2:3')
                    .then(() => {
                      assert(false);
                      done();
                    }, err => {
                      assert.equal(err.errors.length, 2);
                      done();
                    });
    });

    it('should not create RestaurantHours that have a close time earlier than' +
       'open time', done => {
      RestaurantHour.create(dayOfTheWeek, openTime, '00:00:00')
                    .then(() => {
                      assert(false);
                      done();
                    }, err => {
                      assert.equal(err.errors.length, 1);
                      done();
                    });
    });

    it('should not create RestaurantHours that have null dayOfTheWeek,' +
       'null openTime or null closeTime', done => {
      RestaurantHour.create(null, null, null)
                    .then(() => {
                      assert(false);
                      done();
                    }, err => {
                      assert.equal(err.errors.length, 3);
                      done();
                    });
    });

    it('should not create RestaurantHour with invalid dayOfTheWeek', done => {
      RestaurantHour.create('InvalidDay', openTime, closeTime)
                    .then(() => {
                      assert(false);
                      done();
                    }, err => {
                      assert.equal(err.errors.length, 1);
                      done();
                    });
    });
  });
});
