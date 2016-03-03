import {clearDatabase, disconnectDatabase} from './test-init.es6';
import * as User from '../api/controllers/user.es6';
import fetch from '../libs/fetch.es6';
import assert from 'assert';

const phone = '7135011837';
let session;

const {SERVER_URL} = global;

before(async () => await clearDatabase());
after(() => disconnectDatabase());

describe('User', () => {
  it('should create a user', async () => {
    await User.UserModel.create('7135011837', 'Mathew Kurian', 'test@gmail.com');
  });

  it('should create a user edit session', async () => {
    const {secret} = await User.requestProfileEdit(phone);
    session = secret;
  });

  it('should retrieve user profile', async () => {
    const {body: {data: {phoneNumber, name, email}}} =
      await fetch(`${SERVER_URL}/api/v2/user/profile/${session}`);

    assert(phoneNumber, '7135011837');
    assert(name, 'Mathew Kurian');
    assert(email, 'test@gmail.com');
  });

  it('should edit user profile', async () => {
    const {body: {data: {phoneNumber, name, email}}} =
      await fetch(`${SERVER_URL}/api/v2/user/profile/${session}`, {
        method: 'post',
        body: {
          phoneNumber: '5555555555',
          name: 'Jesse Mao',
          email: 'kfu@gmail.com'
        }
      });

    assert(phoneNumber, '7135011837');
    assert(name, 'Jesse Mao');
    assert(email, 'kfu@gmail.com');
  });

  it('should throw an error', async () => {
    try {
      await fetch(`${SERVER_URL}/api/v2/user/profile/56d6b9e1e3a48c06056a421f`, {
        method: 'post',
        body: {
          phoneNumber: null,
          name: null,
          email: null
        }
      });

      assert.fail('id found; incorrect!');
    } catch (e) {
      assert.ok('id not found; correct!');
    }
  });
});
