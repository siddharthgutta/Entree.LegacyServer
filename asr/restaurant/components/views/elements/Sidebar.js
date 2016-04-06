import React from 'react';
import Influx from 'react-influx';
import {onClick} from '../../../../libs/utils';
import Dispatcher from '../../../dispatchers/Dispatcher';
import OrderStore, {Status} from '../../../stores/OrderStore';
import Checkbox from '../general/Checkbox';

class Sidebar extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {restaurant: {}};
  }

  getListeners() {
    return [
      [OrderStore, OrderStore.Events.RESTAURANT_UPDATED, this._onOrderStoreRestaurantUpdated],
      [Dispatcher, Dispatcher.Events.CONNECTION_STATUS, this._onDispatcherConnectionStatus]
    ];
  }

  _onOrderStoreRestaurantUpdated(restaurant) {
    this.setState({restaurant});
  }

  _onDispatcherConnectionStatus(status) {
    if (status === Status.CONNECTED) {
      OrderStore.fetchRestaurantInfo(); // TODO move to Store
    }
  }

  async _handleToggle(enabled) {
    const restaurant = this.state.restaurant;
    restaurant.enabled = enabled;
    this.setState({restaurant});

    const _restaurant = await OrderStore.setRestaurantEnabled(enabled);
    restaurant.enabled = _restaurant.enabled;
    this.setState({restaurant});
  }

  render() {
    const {restaurant} = this.state;
    const summary = restaurant.Orders ? restaurant.Orders[0] : {};

    // TODO the Orders key is an array??
    return (
      <div className='sidebar flex vertical' style={{width: 300, height: '100%'}}>
        <div className='flex center vertical' style={{height: 150, minHeight: 150, width: '100%'}}>
          <div className='full blur' style={{position: 'absolute', backgroundImage: `url(${restaurant.profileImage})`,
            height: 400, width: '100%', top: 0, opacity: 0.5, zIndex: 0}}/>
          <div className='profile' style={{backgroundImage: `url(${restaurant.profileImage})`,
            backgroundSize: 'cover', width: 90, height: 90, borderRadius: '100%', zIndex: 2}}/>
        </div>
        <div className='title'>{restaurant.name}</div>
        <div className='subtitle'>Austin, TX</div>
        <div className='flex median' style={{minHeight: 80, marginTop: 20}}>
          <div className='box flex center vertical'
               style={{borderRight: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div className='value'>
              <div className='bubble light icon dollar'/>
              {((Number(summary.netPrice) || 0) / 100).toFixed(2)}
            </div>
            <div className='desc'>MONTH INCOME</div>
          </div>
          <div className='box flex center vertical'>
            <div className='value'>{summary.netCount || 0}</div>
            <div className='desc'>MONTH ORDERS</div>
          </div>
        </div>
        <div className='full scroll scroll-y'>
          <div className='flex'
               style={{padding: 20, lineHeight: '21px', background: 'rgba(255, 255, 255, 0.07)',
               borderTop: '1px solid rgba(255, 255, 255, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div className='box accept-label'>Accept new orders</div>
            <div className='box'>
              <Checkbox checked={restaurant.enabled} toggle
                        onChange={e => this._handleToggle(e.target.checked)}/>
            </div>
          </div>
          <div className='item selected' {...onClick(() => this.context.history.push('/orders'))}>ORDERS</div>
          <div className='item' style={{marginBottom: 10}}>DECLINED</div>
          <div className='big-button' {...onClick(() => Dispatcher.emit(Dispatcher.Events.LOGOUT))}>SIGN OUT</div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
