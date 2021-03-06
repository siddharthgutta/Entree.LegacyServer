import assert from 'assert';
import {clearDatabase} from './test-init.es6';
import * as User from '../api/user.es6';
import * as Order from '../api/controllers/order.es6';
import * as Restaurant from '../api/controllers/restaurant.es6';

beforeEach(() => clearDatabase());

describe('ChatState', () => {
  const phoneNumber = '1234567890';
  const name = 'Name';
  const email = 'name@domain.com';

  const state = 'Start';

  const k1 = 6;
  const v1 = 2;
  const k2 = 8;
  const v2 = 1;

  if (console) {
    console.log('true');
  }

  describe('#insertChatState()', () => {
    it('should set a chat state correctly', done => {
      User.create(phoneNumber, name, email)
          .then(user => user.insertChatState(state))
          .then(chatState => {
            assert.equal(chatState.state, state);
            done();
          });
    });

    it('should not set a chat state with null state', done => {
      User.create(phoneNumber, name, email)
          .then(user => user.insertChatState(null))
          .then(() => {
            assert(false);
            done();
          })
          .catch(() => {
            assert(true);
            done();
          });
    });

    it('should not set a chat state when one exists for the user already', done => {
      let user;
      User.create(phoneNumber, name, email)
          .then(_user => user = _user)
          .then(() => user.insertChatState(state))
          .then(() => user.insertChatState(state))
          .then(() => {
            assert(false);
            done();
          })
          .catch(() => {
            assert(true);
            done();
          });
    });
  });

  describe('#findChatState()', () => {
    it('should find the chat state correctly,', done => {
      let user;
      User.create(phoneNumber, name, email)
          .then(_user => user = _user)
          .then(() => user.insertChatState(state))
          .then(() => user.findChatState())
          .then(chatState => {
            assert.equal(chatState.state, state);
            done();
          });
    });

    it('should return null if there is no chat state', async done => {
      const user = await User.create(phoneNumber, name, email);
      try {
        await user.findChatState();
        assert(false);
      } catch (findChatStateErr) {
        done();
      }
    });
  });

  describe('#addMapping()', () => {
    it('should add command mappings to a chat state correctly', done => {
      User.create(phoneNumber, name, email)
          .then(user => user.insertChatState(state))
          .then(chatState => chatState.insertCommandMap(k1, v1))
          .then(mapping => {
            assert.equal(mapping.key, k1);
            assert.equal(mapping.value, v1);
            done();
          });
    });

    it('should not add a command mapping with null key', done => {
      User.create(phoneNumber, name, email)
          .then(user => user.insertChatState(state))
          .then(chatState => chatState.insertCommandMap(null, v1))
          .then(() => {
            assert(false);
            done();
          })
          .catch(() => {
            assert(true);
            done();
          });
    });

    it('should not add a command mapping with null value', done => {
      User.create(phoneNumber, name, email)
          .then(user => user.insertChatState(state))
          .then(chatState => chatState.insertCommandMap(k1, null))
          .then(() => {
            assert(false);
            done();
          })
          .catch(() => {
            assert(true);
            done();
          });
    });
  });

  describe('#findMappings()', () => {
    it('should find all mappings for a chat state', done => {
      let chatState;
      User.create(phoneNumber, name, email)
          .then(user => user.insertChatState(state))
          .then(_chatState => chatState = _chatState)
          .then(() => chatState.insertCommandMap(k1, v1))
          .then(() => chatState.insertCommandMap(k2, v2))
          .then(() => chatState.findCommandMaps())
          .then(result => {
            assert.equal(result.length, 2);
            assert.equal(result[0].key, k1);
            assert.equal(result[0].value, v1);
            assert.equal(result[1].key, k2);
            assert.equal(result[1].value, v2);
            done();
          });
    });
  });

  describe('#clearMappings()', () => {
    it('should clear all mappings for a chat state', done => {
      let chatState;
      User.create(phoneNumber, name, email)
          .then(user => user.insertChatState(state))
          .then(_chatState => chatState = _chatState)
          .then(() => chatState.insertCommandMap(k1, v1))
          .then(() => chatState.insertCommandMap(k2, v2))
          .then(() => chatState.clearCommandMaps())
          .then(() => chatState.findCommandMaps())
          .then(result => {
            assert.equal(result.length, 0);
            done();
          });
    });
  });

  describe('#setOrderContext()', () => {
    it('should set the order context correctly', async () => {
      const restaurant =
        (await Restaurant
          .RestaurantModel
          .create('Rest1', 'rest1', 'test', Restaurant.RestaurantModel.Mode.GOD)).resolve();
      const user = await User.create(phoneNumber, name, email);
      const chatState = await user.insertChatState(state);
      const order1 = await Order.createOrder(user.id, restaurant.id, [
        {
          name: 'Democrat',
          price: 6.50,
          quantity: 1,
          description: 'good drink'
        }, {
          name: 'Republican',
          price: 7.38,
          quantity: 2,
          description: 'great drink'
        }, {
          name: 'Fountain Drink',
          price: 1.05,
          quantity: 2,
          description: 'great drink'
        }
      ]);

      await chatState.setOrderContext(order1.resolve());
    });
  });
});
