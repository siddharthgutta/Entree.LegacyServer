import React from 'react';
import Influx from 'react-influx';
import {onClick, ifcat} from '../../../../libs/utils';
import Dispatcher from '../../../dispatchers/Dispatcher';
import OrderStore, {Status} from '../../../stores/OrderStore';
import Checkbox from '../general/Checkbox';

class Sidebar extends Influx.Component {
  static contextTypes = {
    history: React.PropTypes.object
  };

  constructor(context, props) {
    super(context, props);

    this.state = {restaurant: {}, active: 'orders'};
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
    const orders = restaurant.Orders;
    const summary = Array.isArray(orders) && orders.length ? orders[0] : {};

    // TODO the Orders key is an array??
    return (
      <div className='sidebar flex vertical' style={{width: 300, height: '100%'}}>
        <div className='flex center vertical' style={{height: 150, minHeight: 150, width: '100%'}}>
          <div className='full blur' style={{position: 'absolute', backgroundImage: `url(${restaurant.profileImage})`,
            height: 400, width: '100%', top: 0, opacity: 0.5, zIndex: 0}}/>
          <div className='profile' style={{backgroundImage: `url(${restaurant.profileImage})`,
            backgroundSize: 'cover', borderRadius: '100%', zIndex: 2}}/>
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
               borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div className='box accept-label'>Accept new orders</div>
            <div className='box'>
              <Checkbox checked={restaurant.enabled} toggle
                        onChange={e => this._handleToggle(e.target.checked)}/>
            </div>
          </div>
          <div className={ifcat('item', {selected: this.state.active === 'orders'})}
            {...onClick(() => this.setState({active: 'orders'}) || this.context.history.push('/orders'))}>ORDERS
          </div>
          <div className={ifcat('item', {selected: this.state.active === 'history'})}
            {...onClick(() => this.setState({active: 'history'}) || this.context.history.push('/history'))}
               style={{marginBottom: 10}}>HISTORY
          </div>
          <div className='big-button' {...onClick(() => Dispatcher.emit(Dispatcher.Events.LOGOUT))}>SIGN OUT</div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
