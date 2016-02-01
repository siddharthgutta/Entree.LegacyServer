import React from 'react';
import OrderList from '../elements/OrderList.js';
import TabbedPane from '../general/TabbedPane.js';
import Header from '../../views/elements/Header.js';

class OrderHistory extends React.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {};
  }

  _handleTabChange(tab) {
    document.body.classList.remove('red', 'green', 'blue');
    document.body.classList.add({Received: 'red', Progress: 'green', Completed: 'blue'}[tab]);
  }

  render() {
    const received = <OrderList status='received'/>;
    const completed = <OrderList status='completed'/>;
    const accepted = <OrderList status='accepted'/>;
    const header = <Header title='Order' subtitle='HISTORY' style={{minHeight: 55, borderBottom: 'none'}}/>;

    return (
        <div className='full'>
          <div className='full-abs'>
            <div className='full flex vertical'>
              {header}
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
          </div>
        </div>
    );
  }
}

export default OrderHistory;
