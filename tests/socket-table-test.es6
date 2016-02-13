/**
 * Created by kfu on 2/13/16.
 */

import SocketTable from './../message/socket-table.es6';
import assert from 'assert';

describe('Socket Table', () => {
  const st = new SocketTable();

  beforeEach(done => {
    st.clear();
    done();
  });

  describe('Simple Token Tests', () => {
    it('adding multiple tokens should work', done => {
      assert(st.addToken('test1'));
      assert(st.tokenExists('test1'));
      assert.equal(st.numTokens(), 1);
      assert(st.addToken('test2'));
      assert(st.tokenExists('test2'));
      assert(st.numTokens(), 2);
      done();
    });

    it('deleting tokens should work', done => {
      assert(st.addToken('test1'));
      assert(st.tokenExists('test1'));
      assert(st.numTokens(), 1);
      assert(st.removeToken('test1'));
      assert.equal(st.tokenExists('test1'), false);
      assert.equal(st.numTokens(), 0);
      done();
    });

    it('adding the same token should fail', done => {
      assert(st.addToken('test1'));
      assert(st.tokenExists('test1'));
      assert.equal(st.numTokens(), 1);
      assert.equal(st.addToken('test1'), false);
      assert(st.tokenExists('test1'));
      assert.equal(st.numTokens(), 1);
      done();
    });

    it('remove non-existent tokens should fail', done => {
      assert.equal(st.removeToken('test1'), false);
      assert(st.addToken('test1'));
      assert(st.tokenExists('test1'));
      assert.equal(st.numTokens(), 1);
      assert.equal(st.removeToken('test2'), false);
      done();
    });
  });

  describe('Simple Socket Tests', () => {
    beforeEach(done => {
      st.addToken('test1');
      st.addToken('test2');
      done();
    });
  });
});
