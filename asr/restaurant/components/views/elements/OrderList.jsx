import React from 'react'
import Influx from 'react-influx'
import OrderStore from '../../../stores/OrderStore'
import Order from './Order.jsx'
import TabbedPane from './../general/TabbedPane.jsx'
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
          <Order onClick={this.props.onOrderClick.bind(null, order)} key={order.id} {...order} index={i}/>
      );
    });

    // manually animating for now
    return (
        <div className="group full" style={{padding:15,paddingTop:80,background:"rgba(0,0,0,0.7)",overflow:"scroll"}}>
          { !items.length ? <div className="empty">{`No ${this.props.status} orders`}</div> :
              <div className="items" style={{height:items.length * 80}}>{items}</div>  }
        </div>
    )
  }
}

export default OrderList

