import Influx from 'react-influx';
import React from 'react';
import MessageStore from '../../stores/MessageStore';
import Dispatcher from '../../dispatchers/Dispatcher';
import Messenger from './../../../components/Messenger';

class Chat extends Influx.Component {
  constructor(context, props) {
    super(context, props);
    this.state = {user: null, messages: []};
  }

  getListeners() {
    return [
      [MessageStore, MessageStore.Events.RECEIVED, this._addMessage],
      [Dispatcher, Dispatcher.Events.SELECT_USER, this._selectUser]
    ];
  }

  _selectUser(user) {
    this.setState({user, messages: MessageStore.getMessages(user)});
  }

  _addMessage() {
    // TODO perform check and update only if necessary
    if (this.state.user) {
      this.setState({messages: MessageStore.getMessages(this.state.user)});
    }
  }

  _insertMessage(message) {
    const {user} = this.state;
    MessageStore.sendSMS(user.number, message);
  }

  render() {
    const {messages, user} = this.state;

    if (user === null) {
      return (
          <div className='empty'>SELECT A USER TO BEGIN</div>
      );
    }

    return (
        <Messenger messages={messages} me={MessageStore.getMe()} them={user}
                   insertMessage={msg => this._insertMessage(msg)}/>
    );
  }
}

export default Chat;
