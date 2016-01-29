import './test-init.es6';
import assert from 'assert';
import config from 'config';
import * as User from '../api/user.es6';

describe('User', function () {

  var attr = {
    name: 'TestUser',
    email: 'TestUser@gmail.com',
    pin: '1234',
    phoneNumber: '123-456-7890'
  };

  describe('#create()', function () {
    it('should insert to and query from the database correctly', function (done) {
      User.create(attr).then(function () {
        User.findOne('123-456-7890').then(function (user) {
          assert.equal(user.name, attr.name);
          assert.equal(user.pin, attr.pin);
          assert.equal(user.email, attr.email);
          assert.equal(user.phoneNumber, attr.phoneNumber);
          user.destroy();
          done();
        });
      });
    });
  });

  describe('update()', function () {
    it('should update and query from the database correctly', function (done) {
      User.create(attr).then(function () {
        User.update(attr.phoneNumber, {
          name: 'NewUser',
          email: 'NewUser@gmail.com',
          pin: '5678',
          phoneNumber: '123-456-1234'
        }).then(function () {
          User.findOne('123-456-1234').then(function (user) {
            assert.equal(user.name, 'NewUser');
            assert.equal(user.pin, '5678');
            assert.equal(user.email, 'NewUser@gmail.com');
            assert.equal(user.phoneNumber, '123-456-1234');
            user.destroy();
            done();
          });
        });
      });
    });
  });

  describe('#destroy()', function () {
    it('should delete from the database correctly', function (done) {
      User.create(attr).then(function () {
        User.destroy('123-456-7890').then(function () {
          User.findOne('123-456-7890').then(function (user) {
            assert.equal(user, null);
            done();
          });
        });
      });
    });
  });

  describe('#create()', function () {
    it('should not create Users that have non-alpha name, invalid email format' +
      'null pin or null phoneNumber', function (done) {
      User.create({
        name: '124-*(@Y',
        email: 'NotAnEmail',
        pin: null,
        phoneNumber: null
      }).then(function (user) {
        assert(false);
        done();
      }, function (err) {
        assert.equal(err.errors.length, 4);
        done();
      });
    });
  });

  describe('#create()', function () {
    it('should not create Users that has non-numeric pin or invalid phone ' +
      'number', function (done) {
      User.create({
        name: 'TestUser',
        email: 'TestUser@gmail.com',
        pin: 'abcd',
        phoneNumber: '123'
      }).then(function (user) {
        assert(false);
        done();
      }, function (err) {
        assert.equal(err.errors.length, 2);
        done();
      });
    });
  });

  describe('#create()', function () {
    it('should not create Users whose pin is not size 4', function (done) {
      User.create({
        name: 'TestUser',
        email: 'TestUser@gmail.com',
        pin: '123',
        phoneNumber: '123-456-7890'
      }).then(function (user) {
        assert(false);
        done();
      }, function (err) {
        assert.equal(err.errors.length, 1);
        done();
      });
    });
  });
});
