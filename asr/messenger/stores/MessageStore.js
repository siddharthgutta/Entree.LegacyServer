import Influx from 'react-influx';
import Dispatcher from '../dispatchers/Dispatcher.js';
import keyMirror from 'keymirror';
import _ from 'underscore';
import Chance from 'chance';

const chance = new Chance();

const Events = keyMirror({
  RECEIVED: null,
  READY: null
});

const testNumbers = _.map(_.range(10), () => chance.phone());
const testMe = testNumbers.shift();
const testReceived = _.map(_.range(80), () => ({
  from: chance.pick(testNumbers),
  to: testMe,
  date: chance.birthday().getTime(),
  content: chance.paragraph({sentences: chance.integer({min: 1, max: 5})})
}));

const testSent = _.map(_.range(80), () => ({
  from: testMe,
  to: chance.pick(testNumbers),
  date: chance.birthday().getTime(),
  content: chance.paragraph({sentences: chance.integer({min: 1, max: 5})})
}));

const testMessages = testSent.concat(testReceived);

class MessageStore extends Influx.Store {
  constructor() {
    super(Dispatcher);

    this.data = {messages: []};
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECT, this._connect]
    ];
  }

  getMe() {
    return {number: testMe};
  }

  sendSMS(to, content) {
    const message = {
      from: testMe,
      to, content,
      time: Date.now()
    };

    this.data.messages.push(message);

    // FORCING for now
    this.emit(Events.RECEIVED, message);
  }

  getMessages(user) {
    return _.filter(this.data.messages, msg => user.number === msg.to || user.number === msg.from);
  }

  _connect() {
    const messages = testMessages;
    this.data.messages = messages.sort((a, b) => a.date - b.date);

    // Connect via socket here --

    this.emit(Events.READY, messages);
  }
}

export default Influx.Store.construct(MessageStore, Events);
