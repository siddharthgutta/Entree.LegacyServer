import './test-init.es6';
import expect from 'expect.js';
import supertest from 'supertest';
import {clearDatabase, disconnectDatabase} from './test-init.es6';
import config from 'config';
import assert from 'assert';
import * as SocketToken from '../api/socketToken.es6';
import _ from 'underscore';
import * as Message from '../api/message.es6';

const port = config.get('Server.port');
const url = `https://localhost:${port}/api/v1`;
const server = supertest.agent(url);

console.log(url);

beforeEach(done => {
  clearDatabase()
  .then(() => done());
});

const runProductionTests = false;
const productionPhoneNumber = '2149664948';

after(() => disconnectDatabase());

describe('Messenger Tests', () => {
  describe('/token endpoint', () => {
    const restaurantId = 0;
    const token = 'abc';

    it('should succeed adding a token to an existing SocketToken; but deletes any non-responsive sockets', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => {
                   server
                   .post(`/messenger/token`)
                   .send({})
                   .expect('Content-type', 'application/json; charset=utf-8')
                   .expect(200)
                   .end((err, res) => {
                     if (err) {
                       // If expected error occurs, test is good
                       console.tag(global.TEST).log(err);
                       expect().fail('Error response returned');
                     }
                     const newToken = res.body.data.accessor.token;
                     SocketToken.findOne(restaurantId)
                                .then(socketToken => {
                                  assert.equal(socketToken.restaurantId, restaurantId);
                                  assert.equal(socketToken.numTokens, 1);
                                  assert(_.isEqual(socketToken.tokens, [newToken]));
                                  done();
                                })
                                .catch(findOneError => {
                                  console.tag(global.TEST).log(findOneError);
                                  expect().fail('Could not find SocketToken');
                                });
                   });
                 })
                 .catch(() => {
                   expect().fail('Failed to create SocketToken');
                 });
    });

    it('should succeed on creating a new SocketToken', done => {
      server
      .post(`/messenger/token`)
      .send({})
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        if (err) {
          // If expected error occurs, test is good
          console.tag(global.TEST).log(err);
          expect().fail('Error response returned');
        }
        const newToken = res.body.data.accessor.token;
        SocketToken.findOne(restaurantId)
                   .then(socketToken => {
                     assert.equal(socketToken.restaurantId, restaurantId);
                     assert.equal(socketToken.numTokens, 1);
                     assert(_.isEqual(socketToken.tokens, [newToken]));
                     done();
                   })
                   .catch(findOneError => {
                     console.tag(global.TEST).log(findOneError);
                     expect().fail('Could not find SocketToken');
                   });
      });
    });

    it('should succeed on creating a new SocketToken', done => {
      SocketToken.addTokenOrCreate(restaurantId, token)
                 .then(() => {
                   SocketToken.addTokenOrCreate(restaurantId, token)
                              .then(() => {
                                SocketToken.addTokenOrCreate(restaurantId, token)
                                           .then(() => {
                                             SocketToken.addTokenOrCreate(restaurantId, token)
                                                        .then(() => {
                                                          server
                                                          .post(`/messenger/token`)
                                                          .send({})
                                                          .expect('Content-type', 'application/json; charset=utf-8')
                                                          .expect(200, done);
                                                        });
                                           });
                              });
                 });
    });
  });

  describe('/messages endpoint', () => {
    const phoneNumber = '9876543210';
    const content = 'This is the message content';
    const restaurantId = 0;
    const noMsgsRestaurantId = 1;
    const date = Date.now();
    const twilioSid = 'abc123';
    const twilioNumber = '0987654321';
    const sentByUser = true;
    const success = true;

    it('should respond with no messages if no messages are created', done => {
      server
      .post(`/messenger/messages`)
      .send({})
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        assert(_.isEqual(res.body.data.count, 0));
        assert(_.isEqual(res.body.data.messages, []));
        done();
      });
    });

    it('should only messages that are the correct id', done => {
      Message.create(
        phoneNumber,
        restaurantId,
        content,
        date,
        twilioSid,
        twilioNumber,
        sentByUser,
        success)
             .then(() => {
               Message.create(
                 phoneNumber,
                 noMsgsRestaurantId,
                 content,
                        date + 100,
                 twilioSid,
                 twilioNumber,
                 sentByUser,
                 success)
                      .then(() => {
                        server
                        .post(`/messenger/messages`)
                        .send({})
                        .expect('Content-type', 'application/json; charset=utf-8')
                        .expect(200)
                        .end((err, res) => {
                          assert(_.isEqual(res.body.data.count, 1));
                          assert.equal(new Date(res.body.data.messages[0].date).getTime(), date);
                          done();
                        });
                      })
                      .catch(secondCreateError => {
                        expect().fail(`Second message could not be created: ${secondCreateError}`);
                      });
             })
             .catch(firstCreateError => {
               expect().fail(`First message could not be created: ${firstCreateError}`);
             });
    });

    it('should receive multiple messages in the db', done => {
      Message.create(
        phoneNumber,
        restaurantId,
        content,
        date,
        twilioSid,
        twilioNumber,
        sentByUser,
        success)
             .then(() => {
               Message.create(
                 phoneNumber,
                 restaurantId,
                 content,
                        date + 100,
                 twilioSid,
                 twilioNumber,
                 sentByUser,
                 success)
                      .then(() => {
                        server
                        .post(`/messenger/messages`)
                        .send({})
                        .expect('Content-type', 'application/json; charset=utf-8')
                        .expect(200)
                        .end((err, res) => {
                          assert(_.isEqual(res.body.data.count, 2));
                          assert.equal(new Date(res.body.data.messages[0].date).getTime(), date + 100);
                          assert.equal(new Date(res.body.data.messages[1].date).getTime(), date);
                          done();
                        });
                      })
                      .catch(secondCreateError => {
                        expect().fail(`Second message could not be created: ${secondCreateError}`);
                      });
             })
             .catch(firstCreateError => {
               expect().fail(`First message could not be created: ${firstCreateError}`);
             });
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
