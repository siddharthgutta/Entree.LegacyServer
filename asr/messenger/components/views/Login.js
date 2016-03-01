import Influx from 'react-influx';
import React from 'react';
import Dispatcher from '../../dispatchers/Dispatcher';
import {onClick} from '../../../libs/utils';
import {findDOMNode} from 'react-dom';

class Chat extends Influx.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {status: 'disconnected'};
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECTED, this._handleConnection.bind(this, true)],
      [Dispatcher, Dispatcher.Events.DISCONNECTED, this._handleConnection.bind(this, false)]
    ];
  }

  _handleConnection(connected, error) {
    this.setState({status: connected ? 'connected' : 'disconnected'});

    const root = this.refs.root;

    if (error) {
      root.classList.remove('animate-hide');
      root.classList.add('animate-show');

      this._shake();
    } else {
      root.classList.remove('animate-show');
      root.classList.add('animate-hide');
    }
  }

  _shake() {
    const wrapper = findDOMNode(this.refs.wrapper);
    wrapper.classList.remove('animate-shake');

    try {
      wrapper.offsetWidth = wrapper.offsetWidth;
    } catch (e) {
      wrapper.offsetWidth; // eslint-disable-line
    }

    wrapper.classList.add('animate-shake');
  }

  _handleLogin() {
    if (this.state.status !== 'disconnected') {
      return this._shake();
    }

    const id = this.refs.id.value;
    const password = this.refs.password.value;

    Dispatcher.emit(Dispatcher.Events.CONNECT, id, password);

    this.setState({status: 'connecting'});
  }

  render() {
    return (
      <div className='full' ref='root' style={{position: 'fixed', left: 0, top: 0, zIndex: 999}}>
        <div className='full-abs' style={{background: 'rgba(255,255,255,0.8)'}}/>
        <div className='full' ref='wrapper'>
          <div className='modal'>
            <div className='label'>Username</div>
            <input className='input' ref='id'/>
            <div className='label'>Password</div>
            <input className='input' ref='password'/>
            <div className='button' {...onClick(() => this._handleLogin())}>Login</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
