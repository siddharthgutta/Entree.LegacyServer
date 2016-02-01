import assert from 'assert';
import './test-init.es6';
import * as Restaurant from '../api/restaurant.es6';
import {initDatabase, destroyDatabase} from '../bootstrap.es6';

before(done => {
  initDatabase().then(() => done());
});

after(() => destroyDatabase());

describe('Restaurant', () => {
  const name = 'TestRestaurant';
  const password = '1234';
  const phoneNumber = '1234567890';

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
      Restaurant.create(null, null, {phoneNumber: '123'}).then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 3);
        done();
      });
    });

    it('should not create Restaurant with non numeric phone number', done => {
      Restaurant.create(name, password, {phoneNumber: 'abcdefghij'}).then(() => {
        assert(false);
        done();
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
});
