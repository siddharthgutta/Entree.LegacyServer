import assert from 'assert';
import './test-init.es6';
import * as Message from '../api/message.es6';
import {initDatabase, destroyDatabase} from '../bootstrap.es6';

before(done => {
  initDatabase().then(() => done());
});

after(() => destroyDatabase());

describe('Message', () => {
  if (console) {
    console.log('true');
  }

  const from = '1234567890';
  const to = '0987654321';
  const content = 'This is the message content';
  const date = Date.now();
  const twilioSid = 'abc123';
  const success = true;

  describe('#create()', () => {
    it('should create a message document correctly', done => {
      Message.create(from, to, content, date, twilioSid, success).then(message => {
        assert.equal(message.from, from);
        assert.equal(message.to, to);
        assert.equal(message.content, content);
        assert.equal(message.date.getTime(), date);
        assert.equal(message.twilioSid, twilioSid);
        assert.equal(message.success, success);
        message.remove().then(() => done());
      });
    });

    it('should not create message with invalid non 10-digit phone number', done => {
      Message.create('123', 'acbdefghij', content, date, twilioSid, success).then(message => {
        message.remove().then(() => {
          assert(false);
          done();
        });
      }, err => {
        assert.equal(Object.keys(err.errors).length, 2);
        done();
      });
    });
  });

  describe('#find()', () => {
    it('find messages correctly by sender and receiver', done => {
      Message.create(from, to, content, date, twilioSid, success).then(() => {
        Message.find(from, to).then(result => {
          assert.equal(result.length, 1);
          assert.equal(result[0].from, from);
          assert.equal(result[0].to, to);
          assert.equal(result[0].content, content);
          assert.equal(result[0].date.getTime(), date);
          assert.equal(result[0].twilioSid, twilioSid);
          assert.equal(result[0].success, success);
          result[0].remove().then(() => done());
        });
      });
    });

    it('find messages correctly by sender and receiver reversed', done => {
      Message.create(from, to, content, date, twilioSid, success).then(() => {
        Message.find(to, from).then(result => {
          assert.equal(result.length, 1);
          assert.equal(result[0].from, from);
          assert.equal(result[0].to, to);
          assert.equal(result[0].content, content);
          assert.equal(result[0].date.getTime(), date);
          assert.equal(result[0].twilioSid, twilioSid);
          assert.equal(result[0].success, success);
          result[0].remove().then(() => done());
        });
      });
    });

    it('only returns results between from and to', done => {
      Message.create(from, to, content, date, twilioSid, success).then(() => {
        Message.create('2222222222', '3333333333', content, date, twilioSid, success).then(() => {
          Message.find(to, from).then(result => {
            assert.equal(result.length, 1);
            assert.equal(result[0].from, from);
            assert.equal(result[0].to, to);
            assert.equal(result[0].content, content);
            assert.equal(result[0].date.getTime(), date);
            assert.equal(result[0].twilioSid, twilioSid);
            assert.equal(result[0].success, success);
            result[0].remove().then(() => done());
          });
        });
      });
    });

    it('orders messages descending by date', done => {
      Message.create(from, to, content, date, twilioSid, success).then(() => {
        Message.create(from, to, content, date + 100, twilioSid, success).then(() => {
          Message.find(to, from).then(result => {
            assert.equal(result.length, 2);
            assert.equal(result[0].date.getTime(), date + 100);
            assert.equal(result[1].date.getTime(), date);
            result[0].remove().then(result[1].remove().then(() => done()));
          });
        });
      });
    });
  });
});
