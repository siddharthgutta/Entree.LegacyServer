import './test-init.es6';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import config from 'config';
import assert from 'assert';
import * as SocketToken from '../api/socketToken.es6';
import * as Message from '../api/message.es6';
import fetch from '../libs/fetch.es6';
import expect from 'expect.js';
import supertest from 'supertest';

const port = config.get('Server.port');
const SERVER_URL = `https://localhost:${port}/api/v1`;
const server = supertest.agent(SERVER_URL);

beforeEach(async () => {
  await clearDatabase();
});

const runProductionTests = false;
const productionPhoneNumber = '2149664948';

after(() => disconnectDatabase());

describe('Messenger Tests', () => {
  describe('/token endpoint', () => {
    const restaurantId = 0;
    const token = 'abc';

    it('should succeed adding a token to an existing SocketToken; but deletes any non-responsive sockets', async () => {
      await SocketToken.addTokenOrCreate(restaurantId, token);
      const {body: {data: {accessor: {token: newToken}}}} =
        await fetch(`${SERVER_URL}/messenger/token`, {method: 'post'});
      const socketToken = await SocketToken.findOne(restaurantId);

      assert.equal(socketToken.restaurantId, restaurantId);
      assert.equal(socketToken.numTokens, 1);
      assert.deepStrictEqual(Array.from(socketToken.tokens), [newToken]);
    });

    it('should succeed on creating a new SocketToken', async () => {
      const {body: {data: {accessor: {token: newToken}}}} =
        await fetch(`${SERVER_URL}/messenger/token`, {method: 'post'});
      const socketToken = await SocketToken.findOne(restaurantId);
      assert.equal(socketToken.restaurantId, restaurantId);
      assert.equal(socketToken.numTokens, 1);
      assert.deepStrictEqual(Array.from(socketToken.tokens), [newToken]);
    });

    it('should succeed on creating a new SocketToken', async () => {
      await SocketToken.addTokenOrCreate(restaurantId, token);
      await SocketToken.addTokenOrCreate(restaurantId, token);
      await SocketToken.addTokenOrCreate(restaurantId, token);
      await SocketToken.addTokenOrCreate(restaurantId, token);
      await fetch(`${SERVER_URL}/messenger/token`, {method: 'post'}); // shouldn't throw an error
    });
  });

  describe('/messages endpoint', () => {
    const phoneNumber = '9876543210';
    const content = 'This is the message content';
    const restaurantId = 0;
    const date = Date.now();
    const twilioSid = 'abc123';
    const twilioNumber = '0987654321';
    const sentByUser = true;
    const success = true;

    it('should respond with no messages if no messages are created', async () => {
      const {body: {data: {count, messages}}} = await fetch(`${SERVER_URL}/messenger/messages`, {method: 'post'});
      assert.equal(count, 0);
      assert.deepStrictEqual(Array.from(messages), []);
    });

    it('should only messages that are the correct id', async () => {
      await Message.create(phoneNumber, restaurantId, content, date, twilioSid, twilioNumber, sentByUser, success);
      await Message.create(phoneNumber, restaurantId, content,
                           date + 100, twilioSid, twilioNumber, sentByUser, success);

      const {body: {data: {count, messages}}} = await fetch(`${SERVER_URL}/messenger/messages`, {method: 'post'});
      assert.equal(count, 2);
      assert.equal(new Date(messages[0].date).getTime(), date + 100);
    });

    it('should receive multiple messages in the db', async () => {
      await Message.create(phoneNumber, restaurantId, content, date, twilioSid, twilioNumber, sentByUser, success);
      await Message.create(phoneNumber, restaurantId, content,
                           date + 100, twilioSid, twilioNumber, sentByUser, success);

      const {body: {data: {count, messages}}} = await fetch(`${SERVER_URL}/messenger/messages`, {method: 'post'});

      assert.equal(count, 2);
      assert.equal(new Date(messages[0].date).getTime(), date + 100);
      assert.equal(new Date(messages[1].date).getTime(), date);
    });
  });

  describe('/send endpoint', () => {
    const restaurantId = 0;
    const token = 'abc';

    if (runProductionTests) {
      it('should fail with invalid phone number', done => {
        server
        .post(`/messenger/send`)
        .send({phoneNumber: '123', content: 'Message with invalid number'})
        .expect('Content-type', 'application/json; charset=utf-8')
        .expect(500, done);
      });

      it('should fail without a SocketToken', done => {
        server
        .post(`/messenger/send`)
        .send({phoneNumber: productionPhoneNumber, content: 'Message without existing token'})
        .expect('Content-type', 'application/json; charset=utf-8')
        .expect(500, done);
      });

      it('should fail without a SocketToken', done => {
        SocketToken.addTokenOrCreate(restaurantId, token)
                   .then(() => {
                     server
                     .post(`/messenger/send`)
                     .send({phoneNumber: productionPhoneNumber, content: 'Valid Message'})
                     .expect('Content-type', 'application/json; charset=utf-8')
                     .expect(200, done);
                   })
                   .catch(createError => {
                     expect().fail(`Token could not be created: ${createError}`);
                   });
      });
    }
  });
});
