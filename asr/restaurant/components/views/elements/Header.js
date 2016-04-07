import React from 'react';
import Influx from 'react-influx';
import Dispatcher from '../../../dispatchers/Dispatcher';
import OrderStore, {Status} from '../../../stores/OrderStore';
import {onClick, ifcat} from '../../../../libs/utils';
import {getPlatform} from '../../../../libs/env';

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
      [OrderStore, OrderStore.Events.RESTAURANT_UPDATED, this._onOrderStoreRestaurantUpdated],
      [Dispatcher, Dispatcher.Events.CONNECTION_STATUS, this._onDispatcherConnectionStatus]
    ];
  }

  _onDispatcherConnectionStatus(status) {
    this.setState({status});
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
    const {restaurant, status} = this.state;

    if (restaurant.enabled === false && status !== Status.DISCONNECTED) {
      bannerText = 'You have disabled orders';
    } else {
      bannerText = null;
    }

    const bannerHeight = getPlatform() === 'ios' ? 50 : 35;
    const minHeight = (bannerText ? bannerHeight + 55 : 55 + (getPlatform() === 'ios' ? 20 : 0)); // TODO fix

    return (
      <div style={{minHeight}}>
        {bannerText ? <div className='banner'
          {...onClick(() => Dispatcher.emit(Dispatcher.Events.MENU_VISIBILITY, true))}>{bannerText}</div> : null }
        <div className={ifcat('header', {pad: getPlatform() === 'ios' && !bannerText})} style={this.state.style}>
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
