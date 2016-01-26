import React from 'react'
import Influx from 'react-influx'
import OrderStore from '../../../stores/OrderStore'
import Order from './../elements/Order.jsx'
import TabbedPane from './../general/TabbedPane.jsx'
import _ from 'underscore'

class OrderList extends Influx.Component {
  constructor(...args) {
    super(...args);

    this.state = {orders: OrderStore.getOrders()};
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
        <div className="full">
          <Header />

        </div>
    )
  }
}

export default OrderList

