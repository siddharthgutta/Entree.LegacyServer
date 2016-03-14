import Influx from 'react-influx';
import React from 'react';
import Dispatcher from '../../dispatchers/Dispatcher';
import MessageStore, {Status} from '../../stores/MessageStore';
import {onClick} from '../../../libs/utils';
import {findDOMNode} from 'react-dom';

class Chat extends Influx.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {status: MessageStore.getConnectionStatus()};
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECTION_STATUS, this._onDispatcherConnectionStatus]
    ];
  }

  _onDispatcherConnectionStatus(status) {
    this.setState({status});
    this._handleConnection(status);
  }

  _handleConnection(status) {
    const root = this.refs.root;

    switch (status) {
      case Status.CONNECTED:
        root.classList.remove('animate-show');
        root.classList.add('animate-hide');
        break;
      default:
      case Status.CONNECTING:
        break;
      case Status.DISCONNECTED:
        root.classList.remove('animate-hide');
        root.classList.add('animate-show');
        this._shake();
        break;
    }
  }

  componentDidMount() {
    super.componentDidMount();

    this._handleConnection(this.state.status);
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
    if (this.state.status !== Status.DISCONNECTED) {
      return this._shake();
    }

    const id = this.refs.id.value;
    const password = this.refs.password.value;

    Dispatcher.emit(Dispatcher.Events.LOGIN, id, password);

    this.setState({status: 'connecting'});
  }

  render() {
    return (
      <div className='full' ref='root' style={{position: 'fixed', left: 0, top: 0, zIndex: 999}}>
        <div className='full-abs' style={{background: 'rgba(232,232,232,0.8)'}}/>
        <div className='full' ref='wrapper'>
          <div className='modal'>
            <div className='label'>Username</div>
            <input className='input' ref='id'/>
            <div className='label'>Password</div>
            <input type='password' className='input' ref='password'/>
            <div className='button' {...onClick(() => this._handleLogin())}>Login</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
