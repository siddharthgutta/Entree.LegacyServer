import React from 'react'
import Influx from 'react-influx'
import OrderStore from '../../stores/OrderStore'

class OrderList extends Influx.Component {
  constructor(...args) {
    super(...args);

    this.state = {orders: OrderStore.getOrders()};
  }

  getListeners() {
    return [
      [OrderStore, OrderStore.Events.ORDER_RECEIVED, this._onOrderStoreOrderReceived]
    ];
  }

  _onOrderStoreOrderReceived(nextOrder) {
    this.setState({orders: OrderStore.getOrders()});
  }

  render() {
    const {orders} = this.state;
    const items = orders.map(order => {
      return (
          <div></div>
      );
    });

    return (
        <div className="group">
          <div className="header">Orders</div>
          <div className="items">{items}</div>
        </div>
    )
  }
}

export default OrderList

