import './test-init.es6';
import assert from 'assert';
import * as User from '../api/user.es6';
import {initDatabase, destroyDatabase} from '../bootstrap.es6';
import {resolveContext} from '../bootstrap.es6';
import config from 'config';
const TWILIO_FROM_NUMBER = config.get('Twilio.fromNumbers');
import expect from 'expect.js';
import supertest from 'supertest';
const port = resolveContext().port;
const server = supertest.agent(`http://localhost:${port}`);

before(done => {
  initDatabase().then(() => done());
});

after(() => destroyDatabase());


describe('User', () => {
  const name = 'TestUser';
  const email = 'TestUser@gmail.com';
  const password = '1234';
  const phoneNumber = '1234567890';
  // Modify this number to test your own phone
  const productionPhoneNumber = '2149664948';
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
        it('should fail validation for complex request', done => {
          server
            .post(`/api/user/signup`)
            .send({productionPhoneNumber})
            .expect('Content-type', 'application/json; charset=utf-8')
            .expect(200, done);
        });
      });

      it('should create a new user and send a real SMS message', done => {
        User.signup(productionPhoneNumber).then(response => {
          console.tag(global.TEST).log(`Real SMS response: ${JSON.stringify(response)}`);
          expect(response.to).to.be(`+1${productionPhoneNumber}`);
          expect(response.from).to.be(TWILIO_FROM_NUMBER);
          expect(response.body).to.be.a('string');
          fullWelcomeMessage = response.body;

          User.findOne(productionPhoneNumber).then(user => {
            assert.equal(user.name, null);
            assert.equal(user.password, null);
            assert.equal(user.email, null);
            assert.equal(user.phoneNumber, productionPhoneNumber);
            user.destroy().then(() => done());
          }).catch(error => {
            expect().fail(`Finding User Failed: ${error}`);
          });
        }).catch(error => {
          expect().fail(`Signup Failed: ${error}`);
        });
      });

      it('existing phone number should not be overridden', done => {
        let createdAt;
        let updatedAt;
        User.create(productionPhoneNumber, password, name, email).then(() => {
          User.findOne(productionPhoneNumber).then(user => {
            createdAt = user.createdAt;
            updatedAt = user.updatedAt;
          });
          User.signup(productionPhoneNumber).then(response => {
            expect(response.to).to.be(`+1${productionPhoneNumber}`);
            expect(response.from).to.be(TWILIO_FROM_NUMBER);
            expect(response.body).to.be.a('string');
            expect(fullWelcomeMessage).not.to.equal(response.body);
          });
          User.findOne(productionPhoneNumber).then(user => {
            assert.deepEqual(user.createdAt, createdAt);
            assert.deepEqual(user.updatedAt, updatedAt);
            user.destroy().then(() => done());
          });
        });
      });
    }

    it('should not create user with invalid phone number', done => {
      User.signup('123').then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });

    // This test may be changed when we add more complex validation for phone numbers
    it('should not create user with a phone number with country code', done => {
      User.signup(`+1${productionPhoneNumber}`).then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });
  });


  describe('#create()', () => {
    it('should insert to and query from the database correctly', done => {
      User.create(phoneNumber, password, name, email).then(() => {
        User.findOne(phoneNumber).then(user => {
          assert.equal(user.name, name);
          assert.equal(user.password, password);
          assert.equal(user.email, email);
          assert.equal(user.phoneNumber, phoneNumber);
          user.destroy().then(() => done());
        });
      });
    });

    it('should not create Users that have any null attributes', done => {
      User.create(null, null, null, null).then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });

    it('should not create Users with non alpha-numeric names or invalid emails', done => {
      User.create(phoneNumber, password, '13(*#', 'NotValidEmail').then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 2);
        done();
      });
    });

    it('should not create Users with phone number not length 10', done => {
      User.create('123', password, name, email).then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });

    it('should not create Users with non numeric phone numbers', done => {
      User.create('abcdefghij', password, name, email).then(() => {
        assert(false);
        done();
      }, err => {
        assert.equal(err.errors.length, 1);
        done();
      });
    });
  });

  describe('update()', () => {
    it('should update and query from the database correctly', done => {
      User.create(phoneNumber, password, name, email).then(() => {
        User.update(phoneNumber, {
          name: 'NewUser',
          email: 'NewUser@gmail.com',
          password: '5678',
          phoneNumber: '1234561234'
        }).then(() => {
          User.findOne('1234561234').then(user => {
            assert.equal(user.name, 'NewUser');
            assert.equal(user.password, '5678');
            assert.equal(user.email, 'NewUser@gmail.com');
            assert.equal(user.phoneNumber, '1234561234');
            user.destroy().then(() => done());
          });
        });
      });
    });
  });

  describe('#destroy()', () => {
    it('should delete from the database correctly', done => {
      User.create(phoneNumber, password, name, email).then(() => {
        User.destroy('1234567890').then(() => {
          User.findOne('1234567890').then(user => {
            assert.equal(user, null);
            done();
          });
        });
      });
    });
  });
});
