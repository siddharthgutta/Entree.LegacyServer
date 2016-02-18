import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as SocketToken from '../api/socketToken.es6';
import _ from 'underscore';

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Message', () => {
  if (console) {
    console.log('true');
  }

  const restaurantId = 1;
  const tokens = ['111', '222', '333'];
  const numTokens = 3;
  const token = 'abc';

  describe('#create()', () => {
    it('should create a socketToken document correctly with initial tokens', done => {
      SocketToken.create(restaurantId, {tokens: tokens.slice()}).then(result => {
        assert.equal(result.restaurantId, restaurantId);
        assert.equal(result.numTokens, numTokens);
        assert(_.isEqual(tokens, result.tokens));
        done();
      });
    });

    it('should create a socketToken document correctly with no tokens', done => {
      SocketToken.create(restaurantId).then(result => {
        assert.equal(result.restaurantId, restaurantId);
        assert.equal(result.numTokens, 0);
        assert(_.isEqual(result.tokens, []));
        done();
      });
    });

    it('should not create socketToken with more than max number of tokens', done => {
      SocketToken.create(restaurantId, {tokens: ['1', '2', '3', '4', '5']}).then(() => {
        assert(false);
        done();
      }).catch(() => {
        assert(true);
        done();
      });
    });

    it('should not create socketToken with null restaurantId', done => {
      SocketToken.create(null).then(() => {
        assert(false);
        done();
      }).catch(() => {
        assert(true);
        done();
      });
    });

    it('should not create two socketTokens with same restaurantId', done => {
      SocketToken.create(restaurantId).then(() => {
        SocketToken.create(restaurantId).then(() => {
          assert(false);
          done();
        }).catch(() => {
          assert(true);
          done();
        });
      });
    });
  });

  describe('#addToken()', () => {
    it('should add a token to a socket token correctly', done => {
      SocketToken.create(restaurantId, {tokens: tokens.slice()}).then(() => {
        SocketToken.addToken(restaurantId, token).then(result => {
          assert.equal(result.restaurantId, restaurantId);
          assert.equal(result.numTokens, numTokens + 1);
          assert(_.isEqual(['111', '222', '333', token], result.tokens));
          done();
        });
      });
    });

    it('should not add a token to a socket that already has max number of tokens', done => {
      SocketToken.create(restaurantId, {tokens: ['1', '2', '3', '4']}).then(() => {
        SocketToken.addToken(restaurantId, token).then(() => {
          assert(false);
          done();
        }).catch(() => {
          assert(true);
          done();
        });
      });
    });
  });

  describe('#removeToken()', () => {
    it('should remove a token from a socket token correctly', done => {
      SocketToken.create(restaurantId, {tokens: tokens.slice()}).then(() => {
        SocketToken.removeToken(restaurantId, tokens[0]).then(result => {
          assert.equal(result.restaurantId, restaurantId);
          assert.equal(result.numTokens, numTokens - 1);
          assert(_.isEqual(['222', '333'], result.tokens));
          done();
        });
      });
    });

    it('should not remove a token that does not exist from existing tokens', done => {
      SocketToken.create(restaurantId, {tokens: tokens.slice()}).then(() => {
        SocketToken.removeToken(restaurantId, 'Invalid').then(() => {
          assert(false);
          done();
        }).catch(() => {
          assert(true);
          done();
        });
      });
    });

    it('should not remove a token that does not exist from an empty token list', done => {
      SocketToken.create(restaurantId).then(() => {
        SocketToken.removeToken(restaurantId, tokens[0]).then(() => {
          assert(false);
          done();
        }).catch(() => {
          assert(true);
          done();
        });
      });
    });
  });

  describe('#isValidToken', () => {
    it('should determine if a token is valid', done => {
      SocketToken.create(restaurantId, {tokens: tokens.slice()}).then(() => {
        SocketToken.isValidToken(restaurantId, tokens[0]).then(result => {
          assert.equal(result, true);
          done();
        });
      });
    });

    it('should determine if a token is invalid', done => {
      SocketToken.create(restaurantId, {tokens: tokens.slice()}).then(() => {
        SocketToken.isValidToken(restaurantId, 'Invalid').then(result => {
          assert.equal(result, false);
          done();
        });
      });
    });
  });
});
