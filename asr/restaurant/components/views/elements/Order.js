import React from 'react';
import moment from 'moment';
import {ifcat} from '../../../libs/utils';
import {Link} from 'react-router';

class Order extends React.Component {
  constructor(context, props) {
    super(context, props);
  }

  render() {
    const {order} = this.props;

    return (
        <Link to={`order/${order.id}`}>
          <div className='order flex' style={{height: 80}}>
            <div className='id box flex left'>{order.id}</div>
            <div className='box flex left'>
              <div>
                <div className='name'>{order.name.split(' ')[0]}</div>
                <div className='date'>{moment(order.date).format('h:mm A')}</div>
              </div>
            </div>
            <div className='cost box flex center'>{order.cost.toFixed(2)}</div>
            <div className='box flex right hide'>
              <div className={ifcat('button blue box icon flex center', {
              clock: order.status === 'accepted',
              check: order.status === 'completed',
              cross: order.status === 'declined',
              mail: order.status === 'received',
              bgGreen: order.status === 'accepted',
              bgGray: order.status === 'completed',
              bgRed: order.status === 'declined',
              bgBlue: order.status === 'received'})}>{order.status}</div>
            </div>
            <div className='box flex center vertical evil-icon forward'/>
          </div>
        </Link>
    );
  }
}

export default Order;
