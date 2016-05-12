import assert from 'assert';
import {clearDatabase} from './test-init.es6';
import * as GcmToken from '../api/gcmToken.es6';

beforeEach(() => clearDatabase());

describe('GCM Token', () => {
  if (console) {
    console.log('true');
  }

  const token = 'abc';
  const data = 'the data';

  describe('#set()', () => {
    it('should set a token correctly', async () => {
      const gcmToken = await GcmToken.set(token, data);
      assert.equal(gcmToken.token, token);
      assert.equal(gcmToken.data, data);
    });

    it('should override an existing token correctly', async () => {
      const gcmToken = await GcmToken.set(token, data);
      assert.equal(gcmToken.token, token);
      assert.equal(gcmToken.data, data);

      const newToken = await GcmToken.set(token, 'New Data');
      assert.equal(newToken.token, token);
      assert.equal(newToken.data, 'New Data');
    });

    it('should not set a gcm token with null token', async () => {
      try {
        await GcmToken.set(null, data);
      } catch (error) {
        assert(true);
        return;
      }

      assert(false);
    });

    it('should not set a token with null data', async () => {
      try {
        await GcmToken.set(token, null);
      } catch (error) {
        assert(true);
        return;
      }

      assert(false);
    });
  });

  describe('#get()', () => {
    it('should find a gcm token by token', async () => {
      await GcmToken.set(token, data);

      const gcmToken = await GcmToken.get(token);
      assert.equal(gcmToken.token, token);
      assert.equal(gcmToken.data, data);
    });

    it('should return null if nothing is found', async () => {
      const gcmToken = await GcmToken.get(token);
      assert.equal(gcmToken, null);
    });
  });

  describe('#remove()', () => {
    it('should delete a gcm token correctly', async () => {
      const gcmToken = await GcmToken.set(token, data);
      assert.equal(gcmToken.token, token);
      assert.equal(gcmToken.data, data);

      await GcmToken.remove(token);
      const gcmTokenDeleted = await GcmToken.get(token);
      assert.equal(gcmTokenDeleted, null);
    });
  });

  describe('#has()', () => {
    it('should check whether or not a token exists', async () => {
      const gcmToken = await GcmToken.set(token, data);
      assert.equal(gcmToken.token, token);
      assert.equal(gcmToken.data, data);

      assert.equal(await GcmToken.has(token), true);
      assert.equal(await GcmToken.has('Not a token'), false);
    });
  });
});
