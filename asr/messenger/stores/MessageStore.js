import Influx from 'react-influx';
import Dispatcher from '../dispatchers/Dispatcher.js';
import keyMirror from 'keymirror';
import _ from 'underscore';
import Chance from 'chance';
import fetch from '../../libs/fetch';
import io from 'socket.io-client';
import {format} from 'url';

const chance = new Chance();

const Events = keyMirror({RECEIVED: null, READY: null});

const testNumbers = _.map(_.range(10), () => chance.phone());
const testMe = testNumbers.shift();
const sourceNumber = '0000000000';

// @formatter:off
export const Status = keyMirror({
  CONNECTING: null,
  CONNECTED: null,
  DISCONNECTED: null
});
// @formatter:on

class MessageStore extends Influx.Store {
  constructor() {
    super(Dispatcher);

    this.data = {messages: [], status: Status.DISCONNECTED};

    const token = localStorage.getItem('token');

    if (token) {
      this._fetchMessagesAndStart(token);
    }
  }

  getDispatcherListeners() {
    return [
      [Dispatcher, Dispatcher.Events.LOGIN, this._login]
    ];
  }

  getMe() {
    return {number: sourceNumber};
  }

  sendSMS(to, content) {
    fetch('/api/v2/message/send', {method: 'post', body: {content, phoneNumber: to}})
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

  getConnectionStatus() {
    return this.data.status;
  }

  _setConnectionStatus(status) {
    this.data.status = status;

    Dispatcher.emit(Dispatcher.Events.CONNECTION_STATUS, status);
  }

  async _fetchMessagesAndStart(token) {
    let messages;

    this._setConnectionStatus(Status.CONNECTING);

    try {
      const {body: {data}} = await fetch('/api/v2/message', {method: 'post', body: {token}});
      messages = data.messages;
    } catch (e) {
      return this._setConnectionStatus(Status.DISCONNECTED, e.message);
    }

    this.data.messages = this._transform(messages.reverse());

    this.emit(Events.READY, this.data.messages);

    this._setConnectionStatus(Status.CONNECTED);

    const {body: {data: {address, uuid}}} = await fetch('api/v2/restaurant/socket', {method: 'post', body: {token}});
    const socket = io(format(address), {query: `id=${uuid}`, secure: true});

    this.data.socket = socket;
    this.data.uuid = uuid;

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
  }

  async _login(id, password) {
    const token = await this._connect(id, password);

    localStorage.setItem('token', token);

    this._fetchMessagesAndStart(token);
  }

  async _connect(id, password) {
    let token;

    this._setConnectionStatus(Status.CONNECTING);

    try {
      const {body: {data}} = await fetch('/api/v2/restaurant/login', {method: 'post', body: {id, password}});
      token = data.token;
    } catch (e) {
      return this._setConnectionStatus(Status.DISCONNECTED, e.message);
    }

    this.data.token = token;

    return token;
  }
}

export default Influx.Store.construct(MessageStore, Events);
