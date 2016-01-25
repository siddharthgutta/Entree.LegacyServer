import React from 'react'
import Influx from 'react-influx'
import moment from 'moment'
import {ifcat} from '../../../libs/utils'

class Order extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    const order = this.props;

    //<div className="button box center-vertical icon icon-only phone"/>

    return (
        <div className="order flex" style={{height:'80px',transform:`translate3d(0,${order.index * 80}px,1px)`}}>
          <div className="id box flex left">{order.id}</div>
          <div className="box flex center">
            <div>
              <div className="name">{order.name.split(' ')[0]}</div>
              <div className="date">{moment(order.date).format('h:mm A')}</div>
            </div>
          </div>
          <div className="cost box flex center">{order.cost.toFixed(2)}</div>
          <div className="box flex right">
            <div className={ifcat("button blue box icon flex center", {
                  clock:order.status === 'accepted',
                  check:order.status === 'completed',
                  cross:order.status === 'declined',
                  mail:order.status === 'received',
                  bgGreen:order.status === 'accepted',
                  bgGray:order.status === 'completed',
                  bgRed:order.status === 'declined',
                  bgBlue:order.status === 'received'
                  })}>{order.status}
            </div>
          </div>
        </div>
    )
  }
}

export default Order

