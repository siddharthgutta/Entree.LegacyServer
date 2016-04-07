import React from 'react';
import Dispatcher from '../../../dispatchers/Dispatcher';
import OrderStore, {Status} from '../../../stores/OrderStore';
import {onClick} from '../../../../libs/utils';
import Page from './Page';

class Login extends Page {

  static propTypes = {
    params: React.PropTypes.object,
    history: React.PropTypes.object
  };

  static contextTypes = {
    history: React.PropTypes.object
  };

  constructor(props, context) {
    super(props, context);

    this.state = {status: OrderStore.getConnectionStatus()};
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.CONNECTION_STATUS, this._onDispatcherConnectionStatus]
    ];
  }

  renderHeader() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_HEADER, false);
  }

  _onDispatcherConnectionStatus(status) {
    this.setState({status});
    this._handleConnection(status);
  }

  _handleConnection(status) {
    const {history} = this.context;

    switch (status) {
      case Status.CONNECTED:
        history.push('orders');
        break;
      default:
      case Status.CONNECTING:
        break;
      case Status.DISCONNECTED:
        this._shake();
        break;
    }
  }

  componentDidMount() {
    super.componentDidMount();

    this._handleConnection(this.state.status);

    document.body.classList.remove('red', 'green', 'blue', 'black');
    document.body.classList.add('black');
  }

  _shake() {
    const wrapper = this.refs.wrapper;
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
  }

  render() {
    return (
      <div className='full flex vertical login'>
        <div className='flex vertical'
             style={{padding: '30px 0', height: '100%', minHeight: 130}}>
          <div style={{height: '100%'}}>
            <div className='secondary-logo'></div>
          </div>
          <div style={{padding: 20}} ref='wrapper'>
            <input spellCheck='false' autoCapitalize='none' autoCorrect='false'
                   className='input' placeholder='USERNAME' ref='id'/>
            <input spellCheck='false' type='password' placeholder='PASSWORD' className='input' ref='password'/>
          </div>
        </div>
        <div style={{padding: '0px 20px', background: 'rgba(0,0,0,0.7)', minHeight: 62}}>
          <div className='floater'>
            <div className='flex'>
              <div className='button box green'
                {...onClick(() => this._handleLogin())}>
                LOGIN
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
