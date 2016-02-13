/**
 * Created by kfu on 2/13/16.
 */

import SocketTable from './../message/socket-table.es6';
import assert from 'assert';

describe('Socket Table', () => {
  const st = new SocketTable();
  const token1 = 'test1';
  const token2 = 'test2';
  const socket1 = {socket: 1};
  const socket2 = {socket: 2};

  beforeEach(done => {
    st.clear();
    done();
  });

  describe('Simple Token Tests', () => {
    it('adding multiple tokens should work', done => {
      assert(st.addToken(token1));
      assert(st.tokenExists(token1));
      assert.equal(st.numTokens(), 1);
      assert(st.addToken(token2));
      assert(st.tokenExists(token2));
      assert(st.numTokens(), 2);
      done();
    });

    it('deleting tokens should work', done => {
      assert(st.addToken(token1));
      assert(st.tokenExists(token1));
      assert(st.numTokens(), 1);
      assert(st.removeToken(token1));
      assert.equal(st.tokenExists(token1), false);
      assert.equal(st.numTokens(), 0);
      done();
    });

    it('adding the same token should fail', done => {
      assert(st.addToken(token1));
      assert(st.tokenExists(token1));
      assert.equal(st.numTokens(), 1);
      assert.equal(st.addToken(token1), false);
      assert(st.tokenExists(token1));
      assert.equal(st.numTokens(), 1);
      done();
    });

    it('remove non-existent tokens should fail', done => {
      assert.equal(st.removeToken(token1), false);
      assert(st.addToken(token1));
      assert(st.tokenExists(token1));
      assert.equal(st.numTokens(), 1);
      assert.equal(st.removeToken(token2), false);
      done();
    });
  });

  describe('Simple Socket Tests', () => {
    beforeEach(done => {
      st.addToken(token1);
      st.addToken(token2);
      done();
    });

    it('adding multiple sockets should work', done => {
      assert(st.addSocket(token1, socket1));
      assert(st.tokenDict.get(token1).indexOf(socket1) > -1);
      assert.equal(st.numSockets(token1), 1);
      assert(st.addSocket(token1, socket2));
      assert(st.tokenDict.get(token1).indexOf(socket2) > -1);
      assert.equal(st.numSockets(token1), 2);
      assert(st.addSocket(token2, socket1));
      assert(st.tokenDict.get(token2).indexOf(socket1) > -1);
      assert.equal(st.numSockets(token2), 1);
      assert(st.addSocket(token2, socket2));
      assert(st.tokenDict.get(token2).indexOf(socket2) > -1);
      assert.equal(st.numSockets(token2), 2);
      done();
    });

    it('adding multiple sockets should work', done => {
      assert(st.addSocket(token1, socket1));
      assert(st.addSocket(token1, socket2));
      assert.equal(st.numSockets(token1), 2);
      assert(st.addSocket(token2, socket1));
      assert(st.addSocket(token2, socket2));
      assert.equal(st.numSockets(token2), 2);

      assert(st.removeSocket(token1, socket1));
      assert.equal(st.numSockets(token1), 1);
      assert(st.removeSocket(token1, socket2));
      assert.equal(st.numSockets(token1), 0);
      assert(st.removeSocket(token2, socket1));
      assert.equal(st.numSockets(token2), 1);
      assert(st.removeSocket(token2, socket2));
      assert.equal(st.numSockets(token2), 0);
      done();
    });

    it('removing non-existent sockets should fail', done => {
      assert.equal(st.removeSocket(token1, socket1), false);
      assert.equal(st.removeSocket(token2, socket2), false);

      assert(st.addSocket(token1, socket1));
      assert.equal(st.numSockets(token1), 1);
      assert(st.addSocket(token2, socket2));
      assert.equal(st.numSockets(token2), 1);

      assert.equal(st.removeSocket(token1, socket2), false);
      assert.equal(st.removeSocket(token2, socket1), false);

      assert.equal(st.numSockets(token1), 1);
      assert.equal(st.numSockets(token2), 1);

      done();
    });
  });
});
