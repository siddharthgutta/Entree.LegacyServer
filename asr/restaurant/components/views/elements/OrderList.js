import React from 'react';
import Influx from 'react-influx';
import OrderStore from '../../../stores/OrderStore';
import Order from './Order.js';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class OrderList extends Influx.Component {
  static propTypes = {
    status: React.PropTypes.string,
    empty: React.PropTypes.string,
    history: React.PropTypes.bool
  };

  constructor(context, props) {
    super(context, props);

    const {history, status} = this.props;

    this.state = {
      orders: history ? OrderStore.getHistory(status) : OrderStore.getOrders(status)
    };
  }

  getListeners() {
    return [
      [OrderStore, OrderStore.Events.ORDER_RECEIVED, this._onOrderStoreOrderReceived],
      [OrderStore, OrderStore.Events.ORDER_UPDATED, this._onOrderStoreOrderReceived],
      [OrderStore, OrderStore.Events.HISTORY_UPDATED, this._onOrderStoreHistoryUpdated],
      [OrderStore, OrderStore.Events.READY, this._onOrderStoreReady]
    ];
  }

  componentDidMount() {
    super.componentDidMount();

    if (this.props.history) {
      OrderStore.fetchOrderHistory();
    }
  }

  _onOrderStoreReady() {
    if (this.props.history) {
      const orders = OrderStore.getHistory(this.props.status);
      this.setState({orders});
    } else {
      const orders = OrderStore.getOrders(this.props.status);
      this.setState({orders});
    }
  }

  _onOrderStoreHistoryUpdated() {
    if (!this.props.history) {
      return;
    }

    const orders = OrderStore.getHistory(this.props.status);
    this.setState({orders});
  }

  _onOrderStoreOrderReceived() {
    if (this.props.history) {
      return;
    }

    const orders = OrderStore.getOrders(this.props.status);
    this.setState({orders});
  }

  render() {
    const {orders} = this.state;
    const items = orders.map((order, i) =>
                               <Order relative={this.props.history} key={i} order={order} index={i}/>);

    if (!items.length) {
      items.push(
        <div key='status' className='empty'>{this.props.empty}</div>
      );
    }

    return (
      <ReactCSSTransitionGroup
        component='div'
        className='group full momentum'
        style={{padding: 15, overflowY: 'scroll'}}
        transitionName='order-list'
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        {items}
      </ReactCSSTransitionGroup>
    );
  }
}

export default OrderList;
