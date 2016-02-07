import React from 'react';
import Page from './Page';
import TabbedPane from '../general/TabbedPane.js';
import OrderList from '../../views/elements/OrderList';
import Dispatcher from '../../../dispatchers/Dispatcher';
import Feedback from '../modals/Feedback';
import {onClick} from '../../../../libs/utils';
import keyMirror from 'keymirror';

const Modals = keyMirror({
  FEEDBACK: null
});


class OrderHistory extends Page {
  constructor(context, props) {
    super(context, props);

    this.state = {};
  }

  _handleTabChange(tab) {
    document.body.classList.remove('red', 'green', 'blue');
    document.body.classList.add({Received: 'red', Progress: 'green', Completed: 'blue'}[tab]);
  }

  getModals() {
    return {
      [Modals.FEEDBACK]: <Feedback />
    };
  }

  renderHeader() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_HEADER, 'Order', 'History', {
      style: {minHeight: 55, borderBottom: 'none'},
      leftIcon: 'evil-icon menu',
      onLeftClick: () => Dispatcher.emit(Dispatcher.Events.MENU_VISIBILITY, true)
    });
  }

  render() {
    const received = <OrderList status='received'/>;
    const completed = <OrderList status='completed'/>;
    const accepted = <OrderList status='accepted'/>;

    return (
        <div className='full flex vertical'>
          <TabbedPane spread onChange={tab => this._handleTabChange(tab)} Received={received}
                      Completed={completed} Progress={accepted} tabs={['Received', 'Progress', 'Completed']}/>
          <div style={{padding: '0px 20px', background: 'rgba(0,0,0,0.7)', minHeight: 45}}>
            <div className='floater'>
              <div className='flex'>
                <div className='button box dim' {...onClick(() =>
                    Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, Modals.FEEDBACK, true))}>HAVING ISSUES?
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default OrderHistory;
