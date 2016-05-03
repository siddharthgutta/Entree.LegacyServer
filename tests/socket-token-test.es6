import {clearDatabase} from './test-init.es6';
import assert from 'assert';
import * as SocketToken from '../api/socketToken.es6';
import _ from 'underscore';

beforeEach(() => clearDatabase());

describe('Message', () => {
  const restaurantId = 1;
  const token = 'abc';

  describe('#addTokenOrCreate()', () => {
    it('should add a token to a socket token correctly', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(result => {
                   assert.equal(result.restaurantId, restaurantId);
                   assert.equal(result.numTokens, 1);
                   assert(_.isEqual([token], result.tokens));
                   done();
                 });
    });

    it('should not add a token to a socket that already has max number of tokens', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => SocketToken.addTokenOrCreate(restaurantId, token))
                 .then(() => {
                   assert(false);
                   done();
                 })
                 .catch(() => {
                   assert(true);
                   done();
                 });
    });
  });

  describe('#removeToken()', () => {
    it('should remove a token from a socket token correctly', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.removeToken(restaurantId, token))
                 .then(result => {
                   assert.equal(result.restaurantId, restaurantId);
                   assert.equal(result.numTokens, 0);
                   assert(_.isEqual([], result.tokens));
                   done();
                 });
    });

    it('should error when removing a token that does not exist', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.removeToken(restaurantId, 'Invalid'))
                 .then(() => {
                   assert(false);
                   done();
                 })
                 .catch(() => {
                   assert(true);
                   done();
                 });
    });

    it('should error when removing a token that does not exist', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.removeToken(restaurantId, token))
                 .then(() => SocketToken.removeToken(restaurantId, token))
                 .then(() => {
                   assert(false);
                   done();
                 })
                 .catch(() => {
                   assert(true);
                   done();
                 });
    });
  });

  describe('#isValidToken', () => {
    it('should determine if a token is valid', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.isValidToken(restaurantId, token))
                 .then(result => {
                   assert.equal(result, true);
                   done();
                 });
    });

    it('should determine if a token is invalid', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.isValidToken(restaurantId, 'Invalid'))
                 .then(result => {
                   assert.equal(result, false);
                   done();
                 });
    });
  });

  describe('#findOne', () => {
    it('should find the correct SocketToken given a restaurantId', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.addTokenOrCreate(restaurantId + 1, token))
                 .then(() => SocketToken.findOne(restaurantId))
                 .then(result => {
                   assert.equal(result.restaurantId, restaurantId);
                   assert.equal(result.numTokens, 1);
                   assert(_.isEqual(result.tokens, [token]));
                   done();
                 });
    });

    it('should throw an error if query does not find anything', done => {
      SocketToken.findOne(restaurantId)
                 .then(() => {
                   assert(false);
                   done();
                 })
                 .catch(() => {
                   assert(true);
                   done();
                 });
    });
  });

  describe('#findByToken', () => {
    it('should find the correct SocketToken given an individual token', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => SocketToken.findByToken(token))
                 .then(result => {
                   assert.equal(result.restaurantId, restaurantId);
                   assert.equal(result.numTokens, 1);
                   assert(_.isEqual(result.tokens, [token]));
                   done();
                 });
    });

    it('should throw an error if query does not find anything', done => {
      SocketToken.findOne(restaurantId)
                 .then(() => {
                   assert(false);
                   done();
                 })
                 .catch(() => {
                   assert(true);
                   done();
                 });
    });
  });
});
