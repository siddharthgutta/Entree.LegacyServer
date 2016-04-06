import React from 'react';
import Influx from 'react-influx';
import Dispatcher from '../../../dispatchers/Dispatcher';
import OrderStore from '../../../stores/OrderStore';
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
      rightIcon: null,
      restaurant: {}
    };
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.REQUEST_HEADER, this._onRequestHeader],
      [OrderStore, OrderStore.Events.RESTAURANT_UPDATED, this._onOrderStoreRestaurantUpdated]
    ];
  }

  _onOrderStoreRestaurantUpdated(restaurant) {
    this.setState({restaurant});
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
    let bannerText; // TODO add disconnect status

    if (this.state.restaurant.enabled === false) {
      bannerText = 'You have disabled orders';
    } else if (this.state.restaurant.enabled === true) {
      bannerText = null;
    } else {
      bannerText = 'You are not connected to the server';
    }

    return (
      <div>
        {bannerText ? <div className='banner'
          {...onClick(() => Dispatcher.emit(Dispatcher.Events.MENU_VISIBILITY, true))}>{bannerText}</div> : null }
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
      </div>
    );
  }
}

export default Header;
