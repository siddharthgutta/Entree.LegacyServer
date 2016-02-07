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

  describe('#create()', () => {
    it('should create a message document correctly', done => {
      Message.create(from, to, content, date, twilioSid).then(message => {
        assert.equal(message.from, from);
        assert.equal(message.to, to);
        assert.equal(message.content, content);
        assert.equal(message.date.getTime(), date);
        assert.equal(message.twilioSid, twilioSid);
        message.remove();
        done();
      });
    });
  });

  describe('#find()', () => {
    it('find messages correctly by sender and receiver', done => {
      Message.create(from, to, content, date, twilioSid).then(() => {
        Message.find(from, to).then(result => {
          assert.equal(result.length, 1);
          assert.equal(result[0].from, from);
          assert.equal(result[0].to, to);
          assert.equal(result[0].content, content);
          assert.equal(result[0].date.getTime(), date);
          assert.equal(result[0].twilioSid, twilioSid);
          result[0].remove();
          done();
        });
      });
    });

    it('find messages correctly by sender and receiver reversed', done => {
      Message.create(from, to, content, date, twilioSid).then(() => {
        Message.find(to, from).then(result => {
          assert.equal(result.length, 1);
          assert.equal(result[0].from, from);
          assert.equal(result[0].to, to);
          assert.equal(result[0].content, content);
          assert.equal(result[0].date.getTime(), date);
          assert.equal(result[0].twilioSid, twilioSid);
          result[0].remove();
          done();
        });
      });
    });
  });
});
