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

class OrderHistory extends Page {
  constructor(context, props) {
    super(context, props);

    this.state = {};
  }

  componentDidMount() {
    super.componentDidMount();

    document.body.classList.remove('red', 'green', 'blue', 'black');
    document.body.classList.add('black');
  }

  componentDidUpdate() {
    document.body.classList.remove('red', 'green', 'blue', 'black');
    document.body.classList.add('black');
  }

  getModals() {
    return {
      [Modals.FEEDBACK]: <Feedback onSendFeedback={text => Dispatcher.emit(Dispatcher.Events.FEEDBACK, text)}/>
    };
  }

  renderHeader() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_HEADER, 'Orders', 'History', {
      style: {minHeight: 55, borderBottom: 'none'},
      leftIcon: 'evil-icon menu',
      onLeftClick: () => Dispatcher.emit(Dispatcher.Events.MENU_VISIBILITY)
    });
  }

  render() {
    const completed = <OrderList history status={OrderConstants.Status.COMPLETED} empty='No Completed Orders'/>;
    const declined = <OrderList history status={OrderConstants.Status.DECLINED} empty='No Declined Orders'/>;

    const tabSetup = {
      Completed: completed,
      Declined: declined,
      tabs: ['Completed', 'Declined']
    };

    return (
      <div className='full flex vertical'>
        <TabbedPane spread style={{background: 'rgba(0,0,0,0.7)'}} {...tabSetup}/>
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

export default OrderHistory;
