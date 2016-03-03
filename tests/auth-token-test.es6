import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as AuthToken from '../api/authToken.es6';

beforeEach(done => {
  clearDatabase()
    .then(() => done());
});

after(() => disconnectDatabase());

describe('Message', () => {
  if (console) {
    console.log('true');
  }

  const restaurantId = 1;
  const token = 'abc';

  describe('#createToken()', () => {
    it('should create a token correctly', async done => {
      const authToken = await AuthToken.create(restaurantId, token);
      assert.equal(authToken.restaurantId, restaurantId);
      assert.equal(authToken.token, token);
      done();
    });

    it('should not create a token with null restaurantId', async done => {
      try {
        await AuthToken.create(null, token);
        assert(false);
        done();
      } catch (error) {
        assert(true);
        done();
      }
    });

    it('should not create a token with null token', async done => {
      try {
        await AuthToken.create(restaurantId, null);
        assert(false);
        done();
      } catch (error) {
        assert(true);
        done();
      }
    });
  });

  describe('#findById()', () => {
    it('should find a token by restaurant id correctly', async done => {
      await AuthToken.create(restaurantId, token);

      const authToken = await AuthToken.findById(restaurantId);
      assert.equal(authToken.restaurantId, restaurantId);
      assert.equal(authToken.token, token);
      done();
    });

    it('should return null if nothing is found', async done => {
      const authToken = await AuthToken.findById(restaurantId);
      assert.equal(authToken, null);
      done();
    });
  });

  describe('#findByToken()', () => {
    it('should find an auth token by token correctly', async done => {
      await AuthToken.create(restaurantId, token);
      const authToken = await AuthToken.findByToken(token);
      assert.equal(authToken.restaurantId, restaurantId);
      assert.equal(authToken.token, token);
      done();
    });

    it('should return null if nothing is found', async done => {
      const authToken = await AuthToken.findByToken(token);
      assert.equal(authToken, null);
      done();
    });
  });

  describe('#destroy()', () => {
    it('should delete an auth token correctly', async done => {
      const authToken = await AuthToken.create(restaurantId, token);
      assert.equal(authToken.restaurantId, restaurantId);
      assert.equal(authToken.token, token);

      await AuthToken.destroy(token);
      const authTokenDeleted = await AuthToken.findByToken(token);
      assert.equal(authTokenDeleted, null);
      done();
    });
  });
});
