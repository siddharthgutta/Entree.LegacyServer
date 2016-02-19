import assert from 'assert';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as Message from '../api/message.es6';

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => disconnectDatabase());

describe('Message', () => {
  if (console) {
    console.log('true');
  }

  const phoneNumber = '1234567890';
  const content = 'This is the message content';
  const restaurantId = 1;
  const date = Date.now();
  const twilioSid = 'abc123';
  const twilioNumber = '0987654321';
  const sentByUser = true;
  const success = true;

  describe('#create()', () => {
    it('should create a message document correctly', done => {
      Message.create(
          phoneNumber,
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(message => {
        assert.equal(message.phoneNumber, phoneNumber);
        assert.equal(message.restaurantId, restaurantId);
        assert.equal(message.content, content);
        assert.equal(message.date.getTime(), date);
        assert.equal(message.twilioSid, twilioSid);
        assert.equal(message.twilioNumber, twilioNumber);
        assert.equal(message.sentByUser, sentByUser);
        assert.equal(message.success, success);
        done();
      });
    });

    it('should not create message with invalid non 10-digit phone number', done => {
      Message.create(
          '123',
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(() => {
        assert(false);
        done();
      }).catch(err => {
        assert.equal(Object.keys(err.errors).length, 1);
        done();
      });
    });
  });

  describe('#findByPhone()', () => {
    it('findByPhone messages correctly by phoneNumber', done => {
      Message.create(
          phoneNumber,
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(() => {
        Message.create(
            '1112223333',
            restaurantId,
            content,
            date,
            twilioSid,
            twilioNumber,
            sentByUser,
            success).then(() => {
          Message.findByPhone(phoneNumber).then(result => {
            assert.equal(result.length, 1);
            assert.equal(result[0].phoneNumber, phoneNumber);
            assert.equal(result[0].restaurantId, restaurantId);
            assert.equal(result[0].content, content);
            assert.equal(result[0].date.getTime(), date);
            assert.equal(result[0].twilioSid, twilioSid);
            assert.equal(result[0].twilioNumber, twilioNumber);
            assert.equal(result[0].sentByUser, sentByUser);
            assert.equal(result[0].success, success);
            done();
          });
        });
      });
    });

    it('findByPhone messages correctly by phoneNumber and restaurantId', done => {
      Message.create(
          phoneNumber,
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(() => {
        Message.create(
            phoneNumber,
            2,
            content,
            date,
            twilioSid,
            twilioNumber,
            sentByUser,
            success).then(() => {
          Message.findByPhone(phoneNumber, {restaurantId}).then(result => {
            assert.equal(result.length, 1);
            assert.equal(result[0].phoneNumber, phoneNumber);
            assert.equal(result[0].restaurantId, restaurantId);
            assert.equal(result[0].content, content);
            assert.equal(result[0].date.getTime(), date);
            assert.equal(result[0].twilioSid, twilioSid);
            assert.equal(result[0].twilioNumber, twilioNumber);
            assert.equal(result[0].sentByUser, sentByUser);
            assert.equal(result[0].success, success);
            done();
          });
        });
      });
    });

    it('orders messages descending by date', done => {
      Message.create(
          phoneNumber,
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(() => {
        Message.create(
            phoneNumber,
            restaurantId,
            content,
            date + 100,
            twilioSid,
            twilioNumber,
            sentByUser,
            success).then(() => {
          Message.findByPhone(phoneNumber).then(result => {
            assert.equal(result.length, 2);
            assert.equal(result[0].date.getTime(), date + 100);
            assert.equal(result[1].date.getTime(), date);
            done();
          });
        });
      });
    });
  });

  describe('#findByRestaurant', () => {
    it('finds all messages by restaurant correctly', done => {
      Message.create(
          phoneNumber,
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(() => {
        Message.create(
            phoneNumber,
            2,
            content,
            date,
            twilioSid,
            twilioNumber,
            sentByUser,
            success).then(() => {
          Message.findByRestaurant(restaurantId).then(result => {
            assert.equal(result.length, 1);
            assert.equal(result[0].phoneNumber, phoneNumber);
            assert.equal(result[0].restaurantId, restaurantId);
            assert.equal(result[0].content, content);
            assert.equal(result[0].date.getTime(), date);
            assert.equal(result[0].twilioSid, twilioSid);
            assert.equal(result[0].sentByUser, sentByUser);
            assert.equal(result[0].success, success);
            done();
          });
        });
      });
    });

    it('orders messages descending by date', done => {
      Message.create(
          phoneNumber,
          restaurantId,
          content,
          date,
          twilioSid,
          twilioNumber,
          sentByUser,
          success).then(() => {
        Message.create(
            phoneNumber,
            restaurantId,
            content,
            date + 100,
            twilioSid,
            twilioNumber,
            sentByUser,
            success).then(() => {
          Message.findByRestaurant(restaurantId).then(result => {
            assert.equal(result.length, 2);
            assert.equal(result[0].date.getTime(), date + 100);
            assert.equal(result[1].date.getTime(), date);
            done();
          });
        });
      });
    });
  });
});
