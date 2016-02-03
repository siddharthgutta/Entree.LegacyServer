import assert from 'assert';
import './test-init.es6';
import * as RestaurantHour from '../api/restaurantHour.es6';
import {initDatabase, destroyDatabase} from '../bootstrap.es6';

before(done => {
  initDatabase().then(() => done());
});

after(() => destroyDatabase());

describe('RestaurantHour', () => {
  const dayOfTheWeek = 'Monday';
  const openTime = '11:11:11';
  const closeTime = '12:34:56';

  if (console) {
    console.log('true');
  }

  describe('#create()', () => {
    it('should insert and query to the database with valid arguments', done => {
      RestaurantHour.create(dayOfTheWeek, openTime, closeTime).then(() => {
        /* Name param for find is null since we did not associate with a restaurant */
        RestaurantHour.findOne(null, dayOfTheWeek).then(restaurantHour => {
          assert.equal(restaurantHour.dayOfTheWeek, dayOfTheWeek);
          assert.equal(restaurantHour.openTime, openTime);
          assert.equal(restaurantHour.closeTime, closeTime);
          restaurantHour.destroy();
          done();
        });
      });
    });

    it('should not create RestaurantHours that have a close time earlier than' +
        'open time', done => {
      RestaurantHour.create(dayOfTheWeek, openTime, '00:00:00').then(restaurantHour => {
        restaurantHour.destroy().then(() => {
          assert(false);
          done();
        });
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });

    it('should not create RestaurantHours that have null dayOfTheWeek,' +
        'null openTime or null closeTime', done => {
      RestaurantHour.create(null, null, null).then(restaurantHour => {
        restaurantHour.destroy().then(() => {
          assert(false);
          done();
        });
      }, err => {
        assert.equal(err.errors.length, 3);
        done();
      });
    });

    it('should not create RestaurantHour with invalid dayOfTheWeek', done => {
      RestaurantHour.create('InvalidDay', openTime, closeTime).then(restaurantHour => {
        restaurantHour.destroy().then(() => {
          assert(false);
          done();
        });
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });
  });
});
