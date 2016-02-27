import Influx from 'react-influx';
import Dispatcher from '../dispatchers/Dispatcher.js';
import keyMirror from 'keymirror';
import _ from 'underscore';
import Chance from 'chance';
import fetch from '../../libs/fetch';
import io from 'socket.io-client';
import {format} from 'url';

const chance = new Chance();
const events = {
  RECEIVED: null,
  READY: null
};

const Events = keyMirror(events);

const testNumbers = _.map(_.range(10), () => chance.phone());
const testMe = testNumbers.shift();
const sourceNumber = '0000000000';

class MessageStore extends Influx.Store {
  constructor() {
    super(Dispatcher);

    this.data = {messages: []};

    window.sendSMS = this.sendSMS;
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECT, this._connect]
    ];
  }

  getMe() {
    return {number: sourceNumber};
  }

  sendSMS(to, content) {
    fetch('/api/v2/messenger/send', {method: 'post', body: {content, phoneNumber: to}})
    .then(({body}) => console.log(body));
  }

  getMessages(user) {
    return _.filter(this.data.messages, msg => user.number === msg.to || user.number === msg.from);
  }

  _getTestMessages() {
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

    testMessages.sort((a, b) => a.date - b.date);

    return testMessages;
  }

  _transform(messages) {
    return _.map(messages, msg => ({
      [msg.sentByUser ? 'from' : 'to']: msg.phoneNumber,
      [msg.sentByUser ? 'to' : 'from']: sourceNumber,
      ...msg // ,
      // content: String(msg.content).replace(/^(Sent from your Twilio trial account - )/, '')
    }));
  }

  async _connect() {
    const res = await fetch('/api/v2/access/login', {method: 'post', body: {id: 1, password: 'test'}});
    const {body: {data: {address, uuid}}} = res;

    const {body: {data: {messages}}} = await fetch('/api/v2/message', {method: 'post'});
    const url = format(address);

    const socket = io(url, {query: `id=${uuid}`, secure: true});

    socket.on('send', message => {
      message = this._transform([message])[0];

      this.data.messages.push(message);
      this.emit(Events.RECEIVED, message);
    });

    // TODO optimize
    socket.on('receive', message => {
      message = this._transform([message])[0];

      this.data.messages.push(message);
      this.emit(Events.RECEIVED, message);
    });

    socket.on('alive?', (data, respond) => respond({status: 'ok'}));

    this.data.socket = socket;
    this.data.uuid = uuid;
    this.data.messages = this._transform(messages.reverse());

    this.emit(Events.READY, this.data.messages);
  }
}

export default Influx.Store.construct(MessageStore, Events);
