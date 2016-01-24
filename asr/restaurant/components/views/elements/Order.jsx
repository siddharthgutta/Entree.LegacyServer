import React from 'react'
import Influx from 'react-influx'
import moment from 'moment'

class Order extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    const order = this.props;

    return (
        <div className="order flex" style={{transform:`translate3d(0,${order.index * 60}px,1px)`}}>
          <div className="id box">{order.id}</div>
          <div className="box">
            <div className="name">{order.name.split(' ')[0]}</div>
            <div className="date">{moment(order.date).format('hh:mm A')}</div>
          </div>
          <div className="cost box">{order.cost.toFixed(2)}</div>
          <div className="button box center-vertical icon icon-only phone"/>
          <div className="button blue box center-vertical icon check">Accept</div>
        </div>
    )
  }
}

export default Order

