import React from 'react';
import Influx from 'react-influx';
import TabbedPane from '../general/TabbedPane.js';
import OrderList from '../../views/elements/OrderList';
import Dispatcher from '../../../dispatchers/Dispatcher';

class OrderHistory extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {};
  }

  componentDidMount() {
    this._createHeader();
  }

  componentDidUpdate() {
    this._createHeader();
  }

  _handleTabChange(tab) {
    document.body.classList.remove('red', 'green', 'blue');
    document.body.classList.add({Received: 'red', Progress: 'green', Completed: 'blue'}[tab]);
  }

  _createHeader() {
    Dispatcher.emit(Dispatcher.Events.REQUEST_HEADER, 'Order', 'History', {
      style: {minHeight: 55, borderBottom: 'none'},
      leftIcon: 'evil-icon menu'
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
                <div className='button box dim'>HAVING ISSUES?</div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default OrderHistory;
