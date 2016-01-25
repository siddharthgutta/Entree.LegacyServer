import React from 'react'
import Influx from 'react-influx'
import OrderStore from '../../stores/OrderStore'
import Order from './elements/Order.jsx'
import TabbedPane from './general/TabbedPane.jsx'
import _ from 'underscore'

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
    const orders = OrderStore.getOrders();
    this.setState({
      orders: this.props.status ?
          _.filter(orders, order => order.status === this.props.status) : orders
    });
  }

  render() {
    const {orders} = this.state;
    const items = orders.map((order, i) => {
      return (
          <Order key={order.id} {...order} index={i}/>
      );
    });

    // manually animating for now
    return (
        <div className="group full">
          { !items.length ? <div className="empty center-vertical">{`No ${this.props.status} orders`}</div> :
              <div className="items" style={{height:items.length * 80}}>{items}</div>  }
        </div>
    )
  }
}

export default OrderList

