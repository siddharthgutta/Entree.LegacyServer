import Influx from 'react-influx';
import React from 'react';
import MessageStore from '../../stores/MessageStore';
import {onClick, ifcat} from '../../../libs/utils';
import _ from 'underscore';
import Dispatcher from '../../dispatchers/Dispatcher';

class UserList extends Influx.Component {
  constructor(context, props) {
    super(context, props);
    this.state = {users: [], user: {}};
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.SELECT_USER, this._highlightUser],
      [MessageStore, MessageStore.Events.RECEIVED, this._extractUserFromMessage],
      [MessageStore, MessageStore.Events.READY, this._extractUsersFromMessages]
    ];
  }

  _highlightUser(user) {
    this.setState({user});
  }

  _extractUsersFromMessages(messages) {
    _.map(messages, msg => this._extractUserFromMessage(msg));
  }

  _extractUserFromMessage(message) {
    const {from, content} = message;
    const me = MessageStore.getMe();
    let users = this.state.users;

    if (me.number === message.from) {
      const idx = _.findIndex(users, user => user.number === message.to);
      if (idx > -1) {
        const user = users[idx];
        user.content = content;
      } else {
        users.unshift({content, number: message.to});
      }
    } else {
      users = _.filter(users, user => user.number !== from);
      users.unshift({content, number: from});
    }

    this.setState({users});
  }

  render() {
    const currUser = this.state.user;

    const users = _.map(this.state.users, (user, i) =>
        <div key={i} className={ifcat('flex user', {selected: user.number === currUser.number})}
             style={{width: '100%'}} {...onClick(() => Dispatcher.emit(Dispatcher.Events.SELECT_USER, user))}>
          <div className='box' style={{maxWidth: 60, minWidth: 60}}>
            <div className='flex center vertical'>
              <div className='picture'>{user.number.replace(/[^0-9]/g, '').substring(0, 2)}</div>
            </div>
          </div>
          <div className='box extra'>
            <div className='flex left vertical' style={{alignItems: 'flex-start'}}>
              <div className='number'>{user.number}</div>
              <div className='text'>{user.content}</div>
            </div>
          </div>
        </div>
    );

    return (
        <div className='full user-list scroll scroll-y momentum'>
          {users}
        </div>
    );
  }
}

export default UserList;
