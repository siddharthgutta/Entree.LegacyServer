import './test-init.es6';
import {initDatabase, destroyDatabase} from '../bootstrap.es6';
import assert from 'assert';
import * as User from '../api/user.es6';

describe('User', () => {
  before(done => initDatabase().then(() => done()));

  after(() => destroyDatabase());

  const name = 'TestUser';
  const email = 'TestUser@gmail.com';
  const password = '1234';
  const phoneNumber = '1234567890';

  describe('#create()', () => {
    it('should insert to and query from the database correctly', done => {
      User.create(phoneNumber, password, {name, email}).then(() => {
        User.findOne(phoneNumber).then(user => {
          assert.equal(user.name, name);
          assert.equal(user.password, password);
          assert.equal(user.email, email);
          assert.equal(user.phoneNumber, phoneNumber);
          user.destroy();
          done();
        });
      });
    });

    it('should insert to and query from the database correctly' +
        'without optional params', done => {
      User.create(phoneNumber, password).then(() => {
        User.findOne(phoneNumber).then(user => {
          assert.equal(user.phoneNumber, phoneNumber);
          assert.equal(user.password, password);
          user.destroy();
          done();
        });
      });
    });

    it('should not create Users that have non-alpha name, invalid email format' +
        'null password or null phoneNumber', done => {
      User.create(null, null, {name: '124-*(@Y', email: 'NotAnEmail'}).then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 4);
        done();
      });
    });

    it('should not create Users that has a invalid phone number', done => {
      User.create('123', password, {name, email}).then(() => {
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
      User.create(phoneNumber, password, {name, email}).then(() => {
        User.update(phoneNumber, {
          name: 'NewUser',
          email: 'NewUser@gmail.com',
          password: '5678',
          phoneNumber: '1234561234'
        }).then(() => {
          User.findOne('1234561234').then(user => {
            assert.equal(user.name, 'NewUser');
            assert.equal(user.password, '5678');
            assert.equal(user.email, 'NewUser@gmail.com');
            assert.equal(user.phoneNumber, '1234561234');
            user.destroy();
            done();
          });
        });
      });
    });
  });

  describe('#destroy()', () => {
    it('should delete from the database correctly', done => {
      User.create(phoneNumber, password, name, email).then(() => {
        User.destroy('1234567890').then(() => {
          User.findOne('1234567890').then(user => {
            assert.equal(user, null);
            done();
          });
        });
      });
    });
  });
});
