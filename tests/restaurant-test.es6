import assert from 'assert';
import './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';
import * as RestaurantHour from '../api/restaurantHour.es6';
import * as Location from '../api/location.es6';
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

  const firstAddress = '1234 Main Street';
  const secondAddress = '5678 Burbon Street';
  const city = 'Houston';
  const state = 'TX';
  const zipcode = '48921';

  if (console) {
    console.log('true');
  }

  describe('#create()', () => {
    it('should insert to and query from the database correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(result => {
        Restaurant.findOne(result.id).then(restaurant => {
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
      Restaurant.create(name, password).then(result => {
        Restaurant.findOne(result.id).then(restaurant => {
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
      Restaurant.create(name, password, {phoneNumber}).then(result => {
        Restaurant.update(result.id, {
          name: 'NewRestaurant',
          password: '5678',
          phoneNumber: '1234561234'
        }).then(() => {
          Restaurant.findOne(result.id).then(restaurant => {
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
      Restaurant.create(name, password, {phoneNumber}).then(result => {
        Restaurant.destroy(result.id).then(() => {
          Restaurant.findOne(result.id).then(restaurant => {
            assert.equal(restaurant, null);
            done();
          });
        });
      });
    });

    it('should cascade delete location when deleting restaurant', done => {
      Restaurant.create(name, password, {phoneNumber}).then(() => {
        Location.create(firstAddress, city, state, zipcode, {secondAddress}).then(location => {
          Restaurant.setOrUpdateLocation(name, location).then(() => {
            Restaurant.destroy(name).then(() => {
              Location.findAll().then(result => {
                assert.equal(result.length, 0);
                done();
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

  describe('#addOrUpdateRestaurantHours', () => {
    it('should add and query restaurant hours for a restaurant correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(restaurant => {
        RestaurantHour.create(dayOfTheWeek, openTime, closeTime).then(restaurantHour => {
          Restaurant.addOrUpdateHour(restaurant.id, restaurantHour).then(() => {
            Restaurant.getHours(restaurant.id).then(hours => {
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
          Restaurant.addOrUpdateHour(restaurant.id, restaurantHour).then(() => {
            RestaurantHour.create(dayOfTheWeek, '22:22:22', '33:33:33').then(restaurantHourNew => {
              Restaurant.addOrUpdateHour(restaurant.id, restaurantHourNew).then(() => {
                Restaurant.getHours(restaurant.id).then(hours => {
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
          Restaurant.addOrUpdateHour(restaurant.id, restaurantHour).then(() => {
            RestaurantHour.create('Tuesday', openTime, closeTime).then(restaurantHourNew => {
              Restaurant.addOrUpdateHour(restaurant.id, restaurantHourNew).then(() => {
                Restaurant.getHours(restaurant.id).then(hours => {
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
  });

  describe('#setOrUpdateLocation', () => {
    it('should set the location of a restaurant if one does not exist', done => {
      Restaurant.create(name, password, {phoneNumber}).then(restaurant => {
        Location.create(firstAddress, city, state, zipcode, {secondAddress}).then(location => {
          Restaurant.setOrUpdateLocation(name, location).then(() => {
            restaurant.getLocation().then(result => {
              assert.equal(result.firstAddress, firstAddress);
              assert.equal(result.secondAddress, secondAddress);
              assert.equal(result.city, city);
              assert.equal(result.state, state);
              assert.equal(result.zipcode, zipcode);
              restaurant.destroy();
              done();
            });
          });
        });
      });
    });

    it('should replace an existing location correctly', done => {
      Restaurant.create(name, password, {phoneNumber}).then(restaurant => {
        Location.create(firstAddress, city, state, zipcode, {secondAddress}).then(location => {
          Restaurant.setOrUpdateLocation(name, location).then(() => {
            Location.create('Main St', 'NewCity', 'AB', '09876', {secondAddress: 'NewSecond'}).then(locationNew => {
              Restaurant.setOrUpdateLocation(name, locationNew).then(() => {
                restaurant.getLocation().then(result => {
                  assert.equal(result.firstAddress, 'Main St');
                  assert.equal(result.secondAddress, 'NewSecond');
                  assert.equal(result.city, 'NewCity');
                  assert.equal(result.state, 'AB');
                  assert.equal(result.zipcode, '09876');
                  restaurant.destroy();
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('should delete the old location when replacing', done => {
      Restaurant.create(name, password, {phoneNumber}).then(restaurant => {
        Location.create(firstAddress, city, state, zipcode, {secondAddress}).then(location => {
          Restaurant.setOrUpdateLocation(name, location).then(() => {
            Location.create('Main St', 'NewCity', 'AB', '09876', {secondAddress: 'NewSecond'}).then(locationNew => {
              Restaurant.setOrUpdateLocation(name, locationNew).then(() => {
                Location.findAll().then(result => {
                  assert.equal(result.length, 1);
                  restaurant.destroy();
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
