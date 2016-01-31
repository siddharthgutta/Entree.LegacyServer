import React from 'react';
import OrderList from '../elements/OrderList.js';
import Dispatcher from '../../../dispatchers/Dispatcher';
import TabbedPane from '../general/TabbedPane.js';
import Header from '../../views/elements/Header.js';

class OrderHistory extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {showDialog: false, time: 0};
  }

  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM);
  }

  _addTime(time) {
    this.setState({time: this.state.time + time});
  }

  _handleAccept() {
    this.setState({showDialog: true});
  }

  _handleInput(e) {
    let val = e.target.value;
    this.setState({time: Math.abs(isNaN(val) ? 0 : Number(val))});
  }

  _handleChange(tab) {
    document.body.classList.remove('red', 'green', 'blue');
    document.body.classList.add({Received: 'red', Progress: 'green', Completed: 'blue'}[tab]);
  }

  render() {
    return (
        <div className='full'>
          <div className='full-abs'>
            <div className='full flex vertical'>
              <Header title='Order' subtitle='HISTORY' style={{minHeight: 55, borderBottom: 'none'}}/>
              <TabbedPane spread onChange={() => this._handleChange()}
                          Received={<OrderList onOrderClick={this.props.onOrderClick} status='received'/>}
                          Completed={<OrderList onOrderClick={this.props.onOrderClick} status='completed'/>}
                          Progress={<OrderList onOrderClick={this.props.onOrderClick} status='accepted'/>}
                          tabs={['Received', 'Progress', 'Completed']}/>
              <div style={{padding: '0px 20px', background: 'rgba(0,0,0,0.7)', minHeight:45}}>
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
