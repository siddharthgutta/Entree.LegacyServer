import Influx from 'react-influx';
import React from 'react';
import _ from 'underscore';
import Body from '../elements/Body.js';
import Header from '../elements/Header.js';
import MessageStore from '../../stores/MessageStore.js';

class Chat extends Influx.Component {
  constructor(...args) {
    super(...args);
    this.state = {messages: []};
  }

  getListeners() {
    return [
      [MessageStore, MessageStore.Events.NEW_MESSAGE, this._onNewMessage]
    ];
  }

  _onNewMessage(message) {
    const messages = this.state.messages;
    messages.push(message);
    this.setState({messages});
  }

  render() {
    return (
      <div className='full'>
        <Header text='Notifications' black='true'/>
        <Body className='full' black='true'>
        <div>{_.map(this.state.messages, (m, i) => <div className='message' key={i}>{m.data}</div>)}</div>
        </Body>
      </div>
    );
  }
}

export default Chat;
