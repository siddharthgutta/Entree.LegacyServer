import './test-init.es6';
import assert from 'assert';
import config from 'config';
import * as User from '../api/user.es6';

describe('User', function () {

  var name = 'TestUser';
  var email = 'TestUser@gmail.com';
  var password = '1234';
  var phoneNumber = '1234567890';

  describe('#create()', function () {
    it('should insert to and query from the database correctly', function (done) {
      User.create(phoneNumber, password, {name: name, email: email}).then(function () {
        User.findOne(phoneNumber).then(function (user) {
          assert.equal(user.name, name);
          assert.equal(user.password, password);
          assert.equal(user.email, email);
          assert.equal(user.phoneNumber, phoneNumber);
          user.destroy();
          done();
        });
      });
    });
  });

  describe('#create()', function () {
    it('should insert to and query from the database correctly' +
      'without optional params', function (done) {
      User.create(phoneNumber, password).then(function () {
        User.findOne(phoneNumber).then(function (user) {
          assert.equal(user.phoneNumber, phoneNumber);
          assert.equal(user.password, password);
          user.destroy();
          done();
        });
      });
    });
  });

  describe('update()', function () {
    it('should update and query from the database correctly', function (done) {
      User.create(phoneNumber, password, {name: name, email: email}).then(function () {
        User.update(phoneNumber, {
          name: 'NewUser',
          email: 'NewUser@gmail.com',
          password: '5678',
          phoneNumber: '1234561234'
        }).then(function () {
          User.findOne('1234561234').then(function (user) {
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

  describe('#destroy()', function () {
    it('should delete from the database correctly', function (done) {
      User.create(phoneNumber, password, name, email).then(function () {
        User.destroy('1234567890').then(function () {
          User.findOne('1234567890').then(function (user) {
            assert.equal(user, null);
            done();
          });
        });
      });
    });
  });

  describe('#create()', function () {
    it('should not create Users that have non-alpha name, invalid email format' +
      'null password or null phoneNumber', function (done) {
      User.create(null, null, {name: '124-*(@Y', email: 'NotAnEmail'}).then(function (user) {
        assert(false);
        done();
      }, function (err) {
        assert.equal(err.errors.length, 4);
        done();
      });
    });
  });

  describe('#create()', function () {
    it('should not create Users that has a invalid phone number', function (done) {
      User.create('123', password, {name: name, email: email}).then(function (user) {
        assert(false);
        done();
      }, function (err) {
        assert.equal(err.errors.length, 1);
        done();
      });
    });
  });
});
