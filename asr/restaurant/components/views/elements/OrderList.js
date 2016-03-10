import React from 'react';
import Influx from 'react-influx';
import OrderStore from '../../../stores/OrderStore';
import Order from './Order.js';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class OrderList extends Influx.Component {
  static propTypes = {
    status: React.PropTypes.string,
    empty: React.PropTypes.string
  };

  constructor(context, props) {
    super(context, props);

    this.state = {orders: OrderStore.getOrders(this.props.status)};
  }

  getListeners() {
    return [
      [OrderStore, OrderStore.Events.ORDER_RECEIVED, this._onOrderStoreOrderReceived],
      [OrderStore, OrderStore.Events.ORDER_UPDATED, this._onOrderStoreOrderReceived], // TODO improve this
      [OrderStore, OrderStore.Events.READY, this._onOrderStoreReady]
    ];
  }

  _onOrderStoreReady() {
    const orders = OrderStore.getOrders(this.props.status);
    this.setState({orders});
  }

  _onOrderStoreOrderReceived() {
    const orders = OrderStore.getOrders(this.props.status);
    this.setState({orders});
  }

  render() {
    const {orders} = this.state;
    const items = orders.map((order, i) =>
                               <Order key={order.id} order={order} index={i}/>);

    if (!items.length) {
      items.push(
        <div key='status' className='empty'>{this.props.empty}</div>
      );
    }

    return (
      <ReactCSSTransitionGroup
        component='div'
        className='group full momentum'
        style={{padding: 15, background: 'rgba(0,0,0,0.7)', overflowY: 'scroll'}}
        transitionName='order-list'
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        {items}
      </ReactCSSTransitionGroup>
    );
  }
}

export default OrderList;
