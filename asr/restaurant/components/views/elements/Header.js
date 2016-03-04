import React from 'react';
import Influx from 'react-influx';
import Dispatcher from '../../../dispatchers/Dispatcher';
import {onClick} from '../../../../libs/utils';

class Header extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {
      onLeftClick: Function,
      onRightClick: Function,
      children: null,
      title: null,
      subtitle: null,
      leftIcon: null,
      rightIcon: null
    };
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.REQUEST_HEADER, this._onRequestHeader]
    ];
  }

  _onRequestHeader(title, subtitle, other) {
    if (!title) {
      return this.setState({style: {display: 'none'}});
    }

    other.onLeftClick = typeof other.onLeftClick === 'function' ? other.onLeftClick : () => 0;
    other.onRightClick = typeof other.onRightClick === 'function' ? other.onRightClick : () => 0;

    const state = {
      children: null,
      onLeftClick: null,
      onRightClick: null,
      leftIcon: null,
      rightIcon: null,
      title,
      subtitle,
      ...other
    };

    this.setState(state);
  }

  render() {
    return (
      <div className='header' style={this.state.style}>
        <div className='nav flex'>
          <div {...onClick(() => this.state.onLeftClick())}
            className={`box flex center vertical nav-left ${this.state.leftIcon}`}/>
          <div className='text' style={{flex: 1}}>
            <div className='title'>{this.state.title}</div>
            <div className='subtitle'>{this.state.subtitle}</div>
          </div>
          <div {...onClick(() => this.state.onRightClick())}
            className={`nav-right center vertical ${this.state.rightIcon}`}/>
        </div>
        {this.state.children}
      </div>
    );
  }
}

export default Header;
