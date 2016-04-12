import React from 'react';
import Page from './Page';
import TabbedPane from '../general/TabbedPane.js';
import OrderList from '../../views/elements/OrderList';
import Dispatcher from '../../../dispatchers/Dispatcher';
import Feedback from '../modals/Feedback';
import {onClick} from '../../../../libs/utils';
import keyMirror from 'keymirror';
import {OrderConstants} from '../../../../../api/constants/client.es6';

const Modals = keyMirror({FEEDBACK: null});

class OrderPager extends Page {
  constructor(context, props) {
    super(context, props);

    this.state = {};
  }

  _handleTabChange(tab) {
    const bgSelector = {
      Received: 'red',
      Progress: 'green',
      Ready: 'blue'
    };

    document.body.classList.remove('red', 'green', 'blue', 'black');
    document.body.classList.add(bgSelector[tab]);
  }

  getModals() {
    return {
      [Modals.FEEDBACK]: <Feedback onSendFeedback={text => Dispatcher.emit(Dispatcher.Events.FEEDBACK, text)}/>
    };
  }

  renderHeader() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_HEADER, 'Order', 'History', {
      style: {minHeight: 55, borderBottom: 'none'},
      leftIcon: 'evil-icon menu',
      onLeftClick: () => Dispatcher.emit(Dispatcher.Events.MENU_VISIBILITY)
    });
  }

  render() {
    const received = <OrderList status={OrderConstants.Status.RECEIVED_PAYMENT} empty='No New Orders'/>;
    const ready = <OrderList status={OrderConstants.Status.READY} empty='No Completed Orders'/>;
    const progress = <OrderList status={OrderConstants.Status.ACCEPTED} empty='No Accepted Orders'/>;

    const tabSetup = {
      Received: received,
      Ready: ready,
      Progress: progress,
      tabs: ['Received', 'Progress', 'Ready']
    };

    return (
      <div className='full flex vertical'>
        <TabbedPane spread style={{background: 'rgba(0,0,0,0.7)'}}
                    onChange={tab => this._handleTabChange(tab)} {...tabSetup}/>
        <div style={{padding: '0px 20px', background: 'rgba(0,0,0,0.7)', minHeight: 45}}>
          <div className='floater'>
            <div className='flex'>
              <div className='button box dim'
                {...onClick(() => Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, Modals.FEEDBACK, true))}>
                HAVING ISSUES?
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderPager;
