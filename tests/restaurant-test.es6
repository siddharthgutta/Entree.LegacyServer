import assert from 'assert';
import './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';
import * as RestaurantHour from '../api/restaurantHour.es6';
import {initDatabase, destroyDatabase} from '../bootstrap.es6';

before(done => {
  initDatabase().then(() => done());
});

after(() => destroyDatabase());

describe('Restaurant', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';

  const dayOfTheWeek = 'Monday';
  const openTime = '11:11:11';
  const closeTime = '12:34:56';

  if (console) {
    console.log('true');
  }

  describe('#create()', () => {
    it('should insert to and query from the database correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(() => {
        Restaurant.findOne(name).then(restaurant => {
          assert.equal(restaurant.name, name);
          assert.equal(restaurant.password, password);
          assert.equal(restaurant.phoneNumber, phoneNumber);
          restaurant.destroy();
          done();
        });
      });
    });

    it('should insert to and query from the database correctly' +
        'without optional params', done => {
      Restaurant.create(name, password).then(() => {
        Restaurant.findOne(name).then(restaurant => {
          assert.equal(restaurant.name, name);
          assert.equal(restaurant.password, password);
          restaurant.destroy();
          done();
        });
      });
    });

    it('should not create Restaurants that have null name, null password' +
        'or phone number of length not 10', done => {
      Restaurant.create(null, null, {phoneNumber: '123'}).then(restaurant => {
        restaurant.destroy().then(() => {
          assert(false);
          done();
        });
      }, err => {
        assert.equal(err.errors.length, 3);
        done();
      });
    });

    it('should not create Restaurant with non numeric phone number', done => {
      Restaurant.create(name, password, {phoneNumber: 'abcdefghij'}).then(restaurant => {
        restaurant.destroy().then(() => {
          assert(false);
          done();
        });
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });
  });

  describe('update()', () => {
    it('should update and query from the database correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(() => {
        Restaurant.update(name, {
          name: 'NewRestaurant',
          password: '5678',
          phoneNumber: '1234561234'
        }).then(() => {
          Restaurant.findOne('NewRestaurant').then(restaurant => {
            assert.equal(restaurant.name, 'NewRestaurant');
            assert.equal(restaurant.password, '5678');
            assert.equal(restaurant.phoneNumber, '1234561234');
            restaurant.destroy();
            done();
          });
        });
      });
    });
  });

  describe('#destroy()', () => {
    it('should delete from the database correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(() => {
        Restaurant.destroy(name).then(() => {
          Restaurant.findOne(name).then(restaurant => {
            assert.equal(restaurant, null);
            done();
          });
        });
      });
    });
  });

  describe('#addOrUpdateRestaurantHours', () => {
    it('should add and query restaurant hours for a restaurant correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(restaurant => {
        RestaurantHour.create(dayOfTheWeek, openTime, closeTime).then(restaurantHour => {
          Restaurant.addOrUpdateHour(name, restaurantHour).then(() => {
            Restaurant.getHours(name).then(hours => {
              assert.equal(hours.length, 1);
              assert.equal(hours[0].dayOfTheWeek, dayOfTheWeek);
              assert.equal(hours[0].openTime, openTime);
              assert.equal(hours[0].closeTime, closeTime);
              restaurant.destroy();
              done();
            });
          });
        });
      });
    });

    it('should update and query restaurant hours for a restaurant correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(restaurant => {
        RestaurantHour.create(dayOfTheWeek, openTime, closeTime).then(restaurantHour => {
          Restaurant.addOrUpdateHour(name, restaurantHour).then(() => {
            RestaurantHour.create(dayOfTheWeek, '22:22:22', '33:33:33').then(restaurantHourNew => {
              Restaurant.addOrUpdateHour(name, restaurantHourNew).then(() => {
                Restaurant.getHours(name).then(hours => {
                  assert.equal(hours.length, 1);
                  assert.equal(hours[0].dayOfTheWeek, dayOfTheWeek);
                  assert.equal(hours[0].openTime, '22:22:22');
                  assert.equal(hours[0].closeTime, '33:33:33');
                  restaurant.destroy();
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should support multiple days of the week', done => {
      Restaurant.create(name, password, {phoneNumber}).then(restaurant => {
        RestaurantHour.create(dayOfTheWeek, openTime, closeTime).then(restaurantHour => {
          Restaurant.addOrUpdateHour(name, restaurantHour).then(() => {
            RestaurantHour.create('Tuesday', openTime, closeTime).then(restaurantHourNew => {
              Restaurant.addOrUpdateHour(name, restaurantHourNew).then(() => {
                Restaurant.getHours(name).then(hours => {
                  assert.equal(hours.length, 2);
                  restaurant.destroy();
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should cascade delete restaurant hours', done => {
      Restaurant.create(name, password, {phoneNumber}).then(() => {
        RestaurantHour.create(dayOfTheWeek, openTime, closeTime).then(restaurantHour => {
          Restaurant.addOrUpdateHour(name, restaurantHour).then(() => {
            Restaurant.destroy(name).then(() => {
              RestaurantHour.findOne(name, dayOfTheWeek).then(result => {
                assert.equal(result, null);
                done();
              });
            });
          });
        });
      });
    });
  });
});
