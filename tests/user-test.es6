import {clearDatabase, disconnectDatabase} from './test-init.es6';
import assert from 'assert';
import * as User from '../api/user.es6';
import {signup} from '../api/controllers/user.es6';
import config from 'config';
const TWILIO_FROM_NUMBER = config.get('Twilio.numbers')[0];
import expect from 'expect.js';
import supertest from 'supertest';
const port = config.get('Server.port');
const server = supertest.agent(`https://localhost:${port}`);

beforeEach(done => {
  clearDatabase().then(() => done());
});

after(() => {
  disconnectDatabase();
});


describe('User', () => {
  const firstName = 'TestUser';
  const email = 'TestUser@gmail.com';
  const phoneNumber = '1234567890';
  // Modify this number to test your own phone
  const productionPhoneNumber = '2149664948';
  const fakeNumber = '1234567890';
  // REMOVE THIS NUMBER AND ITS CORRESPONDING TEST WHEN NO LONGER TWILIO TRIAL
  const unverifiedNumber = '8324932791';

  /*
   Only set REAL_SIGNUP to true when wanting to test real text message signup
   Immediately set it to false when done testing
   Disclaimer: Twilio will charge us for these!
   */
  const REAL_SIGNUP = false;

  if (console) {
    console.log('true');
  }

  describe('#signup()', () => {
    if (REAL_SIGNUP) {
      let fullWelcomeMessage;

      describe('/api/user/signup endpoint', () => {
        it('should send 400 response on null number', done => {
          server
          .post(`/api/user/signup`)
          .send({})
          .expect('Content-type', 'application/json; charset=utf-8')
          .expect(400, done);
        });

        it('should signup correctly with valid verified number', done => {
          server
          .post(`/api/user/signup`)
          .send({phoneNumber: productionPhoneNumber})
          .expect('Content-type', 'application/json; charset=utf-8')
          .expect(200, done);
        });

        it('should respond with status 400 on a non-real number', done => {
          server
          .post(`/api/user/signup`)
          .send({phoneNumber: fakeNumber})
          .expect('Content-type', 'application/json; charset=utf-8')
          .expect(400, done);
        });

        // TEMPORARY TEST FOR TWILIO TRIAL
        it('should respond 404 for unverified number', done => {
          server
          .post(`/api/user/signup`)
          .send({phoneNumber: unverifiedNumber})
          .expect('Content-type', 'application/json; charset=utf-8')
          .expect(404, done);
        });
      });

      it('should create a new user and send a real SMS message', done => {
        signup(productionPhoneNumber)
        .then(response => {
          console.tag(global.TEST)
                 .log(`Real SMS response: ${JSON.stringify(response)}`);
          expect(response.to).to.be(`+1${productionPhoneNumber}`);
          expect(response.from).to.be(TWILIO_FROM_NUMBER);
          expect(response.body).to.be.a('string');
          fullWelcomeMessage = response.body;

          User.findOneByPhoneNumber(productionPhoneNumber)
              .then(user => {
                assert.equal(user.firstName, null);
                assert.equal(user.email, null);
                assert.equal(user.phoneNumber, productionPhoneNumber);
                done();
              })
              .catch(error => {
                expect()
                .fail(`Finding User Failed: ${error}`);
              });
        })
        .catch(error => {
          expect()
          .fail(`Signup Failed: ${error}`);
        });
      });

      it('existing phone number should not be overridden', done => {
        let createdAt;
        let updatedAt;
        User.create(productionPhoneNumber, {firstName, email})
            .then(() => {
              User.findOneByPhoneNumber(productionPhoneNumber)
                  .then(user => {
                    createdAt = user.createdAt;
                    updatedAt = user.updatedAt;
                  });
              signup(productionPhoneNumber)
              .then(response => {
                expect(response.to).to.be(`+1${productionPhoneNumber}`);
                expect(response.from).to.be(TWILIO_FROM_NUMBER);
                expect(response.body).to.be.a('string');
                expect(fullWelcomeMessage).not.to
                                          .equal(response.body);
              });
              User.findOneByPhoneNumber(productionPhoneNumber)
                  .then(user => {
                    assert.deepEqual(user.createdAt, createdAt);
                    assert.deepEqual(user.updatedAt, updatedAt);
                    done();
                  });
            });
      });
    }

    it('should not create user with invalid phone number', done => {
      signup('123')
      .then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });

    // This test may be changed when we add more complex validation for phone numbers
    it('should not create user with a phone number with country code', done => {
      signup(`+1${productionPhoneNumber}`)
      .then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });
  });


  describe('#create()', () => {
    it('should insert into the database correctly', done => {
      User.create(phoneNumber, {firstName, email})
          .then(user => {
            assert.equal(user.firstName, firstName);
            assert.equal(user.email, email);
            assert.equal(user.phoneNumber, phoneNumber);
            user.destroy()
                .then(() => done());
          });
    });

    it('should not create Users that have null phoneNumber', done => {
      User.create(null, firstName, email)
          .then(user => {
            user.destroy()
                .then(() => {
                  assert(false);
                  done();
                });
          }, err => {
            assert.equal(err.errors.length, 1);
            done();
          });
    });

    it('should not create Users with invalid email  format', done => {
      User.create(phoneNumber, {firstName, email: 'NotValidEmail'})
          .then(user => {
            user.destroy()
                .then(() => {
                  assert(false);
                  done();
                });
          }, err => {
            assert.equal(err.errors.length, 1);
            done();
          });
    });

    it('should not create Users with phone number not length 10', done => {
      User.create('123', {firstName, email})
          .then(user => {
            user.destroy()
                .then(() => {
                  assert(false);
                  done();
                });
          }, err => {
            assert.equal(err.errors.length, 1);
            done();
          });
    });

    it('should not create Users with non numeric phone numbers', done => {
      User.create('abcdefghij', {firstName, email})
          .then(user => {
            user.destroy()
                .then(() => {
                  assert(false);
                  done();
                });
          }, err => {
            assert.equal(err.errors.length, 1);
            done();
          });
    });
  });

  describe('#update()', () => {
    it('should update and query from the database correctly', done => {
      User.create(phoneNumber, {firstName, email})
          .then(() => {
            User.updateByPhoneNumber(phoneNumber,
                                     {firstName: 'NewUser', email: 'NewUser@gmail.com', phoneNumber: '1234561234'})
                .then(() => {
                  User.findOneByPhoneNumber('1234561234')
                      .then(user => {
                        assert.equal(user.firstName, 'NewUser');
                        assert.equal(user.email, 'NewUser@gmail.com');
                        assert.equal(user.phoneNumber, '1234561234');
                        done();
                      });
                });
          });
    });
  });

  describe('#destroy()', () => {
    it('should delete from the database correctly', done => {
      User.create(phoneNumber, {firstName, email})
          .then(() => {
            User.destroyByPhoneNumber('1234567890')
                .then(() => {
                  User.findOneByPhoneNumber('1234567890')
                      .then(user => {
                        assert.equal(user, null);
                        done();
                      });
                });
          });
    });
  });

  describe('#findOne()', () => {
    it('should query from the database correctly', done => {
      User.create(phoneNumber, {firstName, email})
          .then(() => {
            User.findOneByPhoneNumber(phoneNumber)
                .then(user => {
                  assert.equal(user.firstName, firstName);
                  assert.equal(user.email, email);
                  assert.equal(user.phoneNumber, phoneNumber);
                  user.destroy()
                      .then(() => done());
                });
          });
    });
  });
});
