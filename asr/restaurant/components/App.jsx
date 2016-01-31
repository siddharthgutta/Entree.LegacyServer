import React from 'react'
import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher'
import TabbedPane from './views/general/TabbedPane.jsx'
import Header from './views/elements/Header.jsx'
import OrderHistory from './views/pages/OrderHistory.jsx'
import OrderFocus from './views/pages/OrderFocus.jsx'
import {ifcat} from '../libs/utils'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class App extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {showDialog: false, time: 0, selectedOrder: null};
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
    var val = e.target.value;
    this.setState({time: Math.abs(isNaN(val) ? 0 : Number(val))});
  }

  _selectOrder(order) {
    this.setState({selectedOrder: order});
  }

  render() {
    var items = [
      this.state.selectedOrder ? <OrderFocus key="OrderFocus" order={this.state.selectedOrder}/> :
          <OrderHistory key="OrderHistory" onOrderClick={()=> this._selectOrder()}/>
    ];

    return (
        <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          {items}
        </ReactCSSTransitionGroup>
    );
  }
}

export default App

