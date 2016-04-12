import React from 'react';
import Page from './Page';
import moment from 'moment';
import TabbedPane from '../general/TabbedPane.js';
import Dispatcher from '../../../dispatchers/Dispatcher';
import {ifcat} from '../../../../libs/utils';
import OrderStore from '../../../stores/OrderStore';
import OrderTime from '../modals/OrderTime';
import OrderDecline from '../modals/OrderDecline';
import Chat from '../modals/Chat';
import keyMirror from 'keymirror';
import {onClick} from '../../../../libs/utils';
import {OrderConstants} from '../../../../../api/constants/client.es6';

// @formatter:off
const Modals = keyMirror({
  ORDER_TIME: null,
  ORDER_CANCEL: null,
  CHAT: null
});
// @formatter:on

class OrderFocus extends Page {

  static propTypes = {
    params: React.PropTypes.object,
    history: React.PropTypes.object
  };

  constructor(context, props) {
    super(context, props);

    this.state = {time: 0, order: null};
  }

  _handleColorChange(status) {
    const bgSelector = {
      [OrderConstants.Status.RECEIVED_PAYMENT]: 'red',
      [OrderConstants.Status.ACCEPTED]: 'green',
      [OrderConstants.Status.COMPLETED]: 'blue',
      [OrderConstants.Status.DECLINED]: 'black'
    };

    document.body.classList.remove('red', 'green', 'blue', 'black');
    document.body.classList.add(bgSelector[status]);
  }

  componentDidMount() {
    super.componentDidMount();

    const {params} = this.props;

    OrderStore.fetchOrderById(params.id);
  }

  componentDidUpdate() {
    super.componentDidUpdate();

    const {order} = this.state;

    if (!order) {
      return;
    }

    this._handleColorChange(order.status);
  }

  getListeners() {
    return [
      [OrderStore, OrderStore.Events.ORDER_UPDATED, this._onOrderUpdated]
    ];
  }

  getModals() {
    const {order} = this.state;

    if (!order) {
      return {};
    }

    const cost = OrderStore.getTotalCost(order).toFixed(2);

    // TODO give hide control to parent as well
    return {
      [Modals.CHAT]: <Chat />,
      [Modals.ORDER_TIME]: <OrderTime cost={`${cost}`}
                                      onSubmitTime={prepTime => this._handleRequestOrderStatus(OrderConstants.Status.ACCEPTED, {prepTime})}/>, // eslint-disable-line
      [Modals.ORDER_CANCEL]: <OrderDecline cost={`${cost}`}
                                           onDecline={message => this._handleRequestOrderStatus(OrderConstants.Status.DECLINED, {message})}/> // eslint-disable-line
    };
  }

  renderHeader() {
    const {order} = this.state;
    const {history} = this.props;

    Dispatcher.emit(Dispatcher.Events.REQUEST_HEADER, order ? `#${order.id}` : 'Loading', 'Order', {
      style: {minHeight: 55},
      leftIcon: 'evil-icon back',
      onLeftClick: () => history.goBack()
    });
  }

  _handleRequestOrderStatus(status, {message, prepTime} = {}) {
    const {order} = this.state;

    OrderStore.setOrderStatus(order.id, status, {prepTime, message});
  }

  _onOrderUpdated(order) {
    const {params} = this.props;

    if (order.id !== Number(params.id)) {
      return;
    }

    this.setState({order});
  }

  _getBaseButtons(status) {
    switch (status) {
      default:
        return null;
      case OrderConstants.Status.RECEIVED_PAYMENT:
        return (
          <div style={{padding: '0px 20px', background: 'rgba(0,0,0,0.7)', minHeight: 62}}>
            <div className='floater'>
              <div className='flex'>
                <div className='button box dim'
                  {...onClick(() => Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, Modals.ORDER_CANCEL, true))}>
                  DECLINE
                </div>
                <div className='button box green'
                  {...onClick(() => Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, Modals.ORDER_TIME, true))}>
                  ACCEPT
                </div>
              </div>
            </div>
          </div>
        );
      case OrderConstants.Status.ACCEPTED:
        return (
          <div style={{padding: '0px 20px', background: 'rgba(0,0,0,0.7)', minHeight: 62}}>
            <div className='floater'>
              <div className='flex'>
                <div className='button box dim'
                  {...onClick(() => this._handleRequestOrderStatus(OrderConstants.Status.COMPLETED))}>
                  COMPLETED
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  render() {
    const {order} = this.state;

    if (order === null) {
      return null;
    }

    const cost = OrderStore.getTotalCost(order).toFixed(2);

    const items = (
      <div className='full flex vertical' style={{overflow: 'scroll', overflowX: 'hidden'}}>
        <div className='flex status' style={{minHeight: 53}}>
          <div className={ifcat('box event', {active: order.status === OrderConstants.Status.RECEIVED_PAYMENT})}>
            RECEIVED
          </div>
          <div className={ifcat('box event', {active: order.status === OrderConstants.Status.ACCEPTED})}>PROGRESS</div>
          <div className={ifcat('box event', {active: order.status === OrderConstants.Status.COMPLETED ||
          order.status === OrderConstants.Status.DECLINED})}>
            {order.status === OrderConstants.Status.DECLINED ? 'DECLINED' : 'COMPLETE'}</div>
        </div>
        <div className='full' style={{padding: '10px 15px 0', overflow: 'scroll', background: 'rgba(0,0,0,0.7)'}}>
          {order.Items.map((item, i) => (
            <div className='item flex' key={i}>
              <div className='box flex quantity center vertical'>{item.quantity || 1 }</div>
              <div className='box flex name center vertical'>{item.name}</div>
              <div className='box flex cost center right vertical'>{`$${Number(item.price / 100).toFixed(2)}`}</div>
            </div>
          ))}
        </div>
      </div>
    );

    const details = (
      <div className='full'
           style={{padding: '30px', overflow: 'scroll', overflowX: 'hidden', background: 'rgba(0,0,0,0.7)'}}>
        <div className='box flex left vertical small info'>
          <div className='value'>#{order.id}</div>
          <div className='desc'>ID</div>
        </div>
        <div className='box flex left vertical small info'>
          <div className='value'>{`${order.User.firstName} ${order.User.lastName}`}</div>
          <div className='desc'>NAME</div>
        </div>
        <div className='box flex left vertical small info hide'>
          <div className='value'>{order.status.substring(0, 1).toUpperCase() + order.status.substring(1)}</div>
          <div className='desc'>STATUS</div>
        </div>
        <div className='box flex left vertical small info'>
          <div className='value'>{moment(order.createdAt).calendar()}</div>
          <div className='desc'>DATE</div>
        </div>
      </div>
    );

    return (
      <div className='full flex vertical'>
        <div className='flex'
             style={{padding: '30px 0', minHeight: 130, borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <div className='box flex center vertical'>
            <div className='value'>
              <div className='bubble light icon dollar'/>
              {cost}</div>
            <div className='desc'>TOTAL COST</div>
          </div>
          <div className='box small flex center vertical hide'
               style={{borderRight: '1px solid rgba(255, 255, 255, 0.1)'}}
            {...onClick(() => Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, Modals.CHAT, true))}>
            <div className='value icon message'/>
          </div>
        </div>
        <TabbedPane spread Items={items} Details={details} tabs={['Items', 'Details']}/>
        { this._getBaseButtons(order.status) }
      </div>
    );
  }
}

export default OrderFocus;
