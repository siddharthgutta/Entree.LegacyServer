import React from 'react'
import Influx from 'react-influx'
import Dispatcher from '../dispatchers/Dispatcher'
import TabbedPane from './views/general/TabbedPane.jsx'
import Header from './views/elements/Header.jsx'
import OrderHistory from './views/pages/OrderHistory.jsx'
import OrderFocus from './views/pages/OrderFocus.jsx'
import {ifcat} from '../libs/utils'

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
    if (this.state.selectedOrder) {
      return <OrderFocus order={this.state.selectedOrder}/>
    }

    return <OrderHistory onOrderClick={this._selectOrder.bind(this)}/>;
  }
}

export default App

