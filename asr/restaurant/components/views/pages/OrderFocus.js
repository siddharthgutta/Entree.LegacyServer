import React from 'react';
import Page from './Page';
import moment from 'moment';
import TabbedPane from '../general/TabbedPane.js';
import Dispatcher from '../../../dispatchers/Dispatcher';
import {ifcat} from '../../../libs/utils';
import OrderStore from '../../../stores/OrderStore';
import OrderTime from '../modals/OrderTime';
import keyMirror from 'keymirror';

const Modals = keyMirror({
  ORDER_TIME: null
});

class OrderFocus extends Page {

  static propTypes = {
    params: React.PropTypes.object
  };

  constructor(context, props) {
    super(context, props);

    const {params} = this.props;
    const order = OrderStore.fetchOrderById(params.id);

    this.state = {time: 0, order};
  }

  getListeners() {
    return [
      [OrderStore, OrderStore.ORDER_UPDATED, this._onOrderUpdated]
    ];
  }

  getModals() {
    const {order} = this.state;

    return {
      [Modals.ORDER_TIME]: <OrderTime cost={`$${order.cost}`} onSubmitTime={(time => this.setState({time}))}/>
    };
  }

  renderHeader() {
    const {order} = this.state;
    const {history} = this.props;

    Dispatcher.emit(Dispatcher.Events.REQUEST_HEADER, `#${order.id}`, 'Order', {
      style: {minHeight: 55},
      leftIcon: 'evil-icon back',
      onLeftClick: () => history.goBack()
    });
  }

  _onOrderUpdated(order) {
    const {params} = this.props;

    if (order.id !== params.id) {
      return;
    }

    this.setState({order});
  }

  render() {
    const {order} = this.state;

    const items = (
        <div className='full flex vertical'>
          <div className='flex status' style={{minHeight: 53}}>
            <div className={ifcat('box event', {active: order.status === 'received'})}>RECEIVED</div>
            <div className={ifcat('box event', {active: order.status === 'accepted'})}>PROGRESS</div>
            <div className={ifcat('box event', {active: order.status === 'completed'})}>COMPLETE</div>
          </div>
          <div className='full' style={{padding: '10px 15px 0', overflow: 'scroll', background: 'rgba(0,0,0,0.7)'}}>
            <div className='item flex'>
              <div className='box flex quantity center vertical'>1</div>
              <div className='box flex name center vertical'>Big Combo Box</div>
              <div className='box flex cost center right vertical'>$15.00</div>
            </div>
            <div className='item flex'>
              <div className='box flex quantity center vertical'>1</div>
              <div className='box flex name center vertical'>Large Fries</div>
              <div className='box flex cost center right vertical'>$5.60</div>
            </div>
            <div className='item flex'>
              <div className='box flex quantity center vertical'>1</div>
              <div className='box flex name center vertical'>Big Combo Box</div>
              <div className='box flex cost center right vertical'>$15.00</div>
            </div>
            <div className='item flex'>
              <div className='box flex quantity center vertical'>1</div>
              <div className='box flex name center vertical'>Large Fries</div>
              <div className='box flex cost center right vertical'>$5.60</div>
            </div>
          </div>
        </div>
    );

    const details = (
        <div className='full' style={{padding: '30px', overflow: 'scroll', background: 'rgba(0,0,0,0.7)'}}>
          <div className='box flex left vertical small info'>
            <div className='value'>#{order.id}</div>
            <div className='desc'>ID</div>
          </div>
          <div className='box flex left vertical small info'>
            <div className='value'>{order.name}</div>
            <div className='desc'>NAME</div>
          </div>
          <div className='box flex left vertical small info hide'>
            <div className='value'>{order.status.substring(0, 1).toUpperCase() + order.status.substring(1)}</div>
            <div className='desc'>STATUS</div>
          </div>
          <div className='box flex left vertical small info'>
            <div className='value'>{moment(order.date).calendar()}</div>
            <div className='desc'>DATE</div>
          </div>
        </div>
    );

    return (
        <div className='full flex vertical'>
          <div className='flex'
               style={{padding: '30px 0', minHeight: 130, borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div className='box flex center vertical'
                 style={{borderRight: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <div className='value'>${order.cost}</div>
              <div className='desc'>TOTAL COST</div>
            </div>
            <div className='box small flex center vertical'>
              <div className='value icon message'></div>
            </div>
          </div>
          <TabbedPane spread Items={items} Details={details} tabs={['Items', 'Details']}/>
          <div style={{padding: '0px 20px', background: 'rgba(0,0,0,0.7)', minHeight: 62}}>
            <div className='floater'>
              <div className='flex'>
                <div className='button box dim'>DECLINE</div>
                <div className='button box green' onTouchTap={() => this._handleAccept(true)}
                     onClick={() => Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, Modals.ORDER_TIME, true)}>
                  ACCEPT
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default OrderFocus;
