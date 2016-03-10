import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as User from '../api/controllers/user.es6';
import fetch from '../libs/fetch.es6';
import assert from 'assert';

const phone = '7135011837';
let secret;

const {SERVER_URL} = global;

before(async () => await clearDatabase());
after(() => disconnectDatabase());

describe('User', () => {
  it('should create a user', async () => {
    await User.UserModel.create('7135011837', {firstName: 'Mathew', email: 'test@gmail.com'});
  });

  it('should create a user edit secret', async () => {
    const {secret: _secret} = await User.requestProfileEditByPhoneNumber(phone);
    secret = _secret;
  });

  it('should retrieve user profile', async () => {
    const {body: {data: {user: {phoneNumber, firstName, lastName, email}}}} =
      await fetch(`${SERVER_URL}/api/v2/user/profile/${secret}`);

    assert.equal(phoneNumber, '7135011837');
    assert.equal(firstName, 'Mathew');
    assert.equal(lastName, null);
    assert.equal(email, 'test@gmail.com');
  });

  it('should edit user profile', async () => {
    const {body: {data: {user: {phoneNumber, firstName, lastName, email}}}} =
      await fetch(`${SERVER_URL}/api/v2/user/profile/${secret}`, {
        method: 'post',
        body: {
          phoneNumber: '5555555555',
          firstName: 'Jesse',
          lastName: 'Mao',
          email: 'kfu@gmail.com'
        }
      });

    assert.equal(phoneNumber, '7135011837');
    assert.equal(firstName, 'Jesse');
    assert.equal(lastName, 'Mao');
    assert.equal(email, 'kfu@gmail.com');
  });

  it('should throw an error', async () => {
    try {
      await fetch(`${SERVER_URL}/api/v2/user/profile/56d6b9e1e3a48c06056a421f`, {
        method: 'post',
        body: {
          phoneNumber: null,
          firstName: null,
          email: null
        }
      });

      assert.fail('id found; incorrect!');
    } catch (e) {
      assert.ok('id not found; correct!');
    }
  });
});
