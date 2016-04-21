import React from 'react';
import moment from 'moment';
import {ifcat, onClick} from '../../../../libs/utils';
import {OrderConstants} from '../../../../../api/constants/client.es6';
import OrderStore from '../../../stores/OrderStore';

class Order extends React.Component {
  static propTypes = {
    relative: React.PropTypes.bool,
    order: React.PropTypes.object
  };

  static contextTypes = {
    history: React.PropTypes.object
  };

  // TODO use OrderStore function
  _calculateCost() {
    const {order} = this.props;

    /* Divide by 100 since we process in cents */
    return (order.Items.reduce((memo, item) => item.price + memo, 0)) / 100;
  }

  render() {
    const {order} = this.props;
    const {history} = this.context;
    const cost = this._calculateCost();

    const colorSelector = {
      clock: order.status === OrderConstants.Status.ACCEPTED,
      check: order.status === OrderConstants.Status.COMPLETED,
      cross: order.status === OrderConstants.Status.DECLINED,
      mail: order.status === OrderConstants.Status.RECEIVED_PAYMENT,
      bgGreen: order.status === OrderConstants.Status.ACCEPTED,
      bgGray: order.status === OrderConstants.Status.COMPLETED,
      bgRed: order.status === OrderConstants.Status.DECLINED,
      bgBlue: order.status === OrderConstants.Status.RECEIVED_PAYMENT
    };

    const date = this.props.relative ?
      moment(order.createdAt).fromNow() : moment(order.createdAt).format('h:mm A');

    return (
      <div className='order flex' style={{height: 80}}
        {...onClick(() => history.push(`order/${order.id}`))}>
        <div className='id box flex left'>{order.id2}</div>
        <div className='box flex left'>
          <div>
            <div className='name'>{OrderStore.getFirstName(order)}</div>
            <div className='date'>{date}</div>
          </div>
        </div>
        <div className='cost box flex center'>{cost.toFixed(2)}</div>
        <div className='box flex right hide'>
          <div className={ifcat('button blue box icon flex center', colorSelector)}>{order.status}</div>
        </div>
        <div className='box flex center vertical evil-icon forward'/>
      </div>
    );
  }
}

export default Order;
