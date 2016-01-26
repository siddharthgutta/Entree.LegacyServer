import React from 'react'
import Influx from 'react-influx'
import OrderList from './views/OrderList.jsx'
import Dispatcher from '../dispatchers/Dispatcher'
import TabbedPane from './views/general/TabbedPane.jsx'
import Header from './views/elements/Header.jsx'
import {ifcat} from '../libs/utils'

class App extends Influx.Component {
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
    var val = e.target.value;
    this.setState({time: Math.abs(isNaN(val) ? 0 : Number(val))});
  }

  render() {
    return (
        <div className="full">
          <div className="full-abs">
            <div className="full flex vertical">
              <Header title="Order" subtitle="HISTORY" style={{minHeight:55}}/>
              <div className="full">
                <TabbedPane spread={true}
                            Received={<OrderList status="received"/>}
                            Progress={<OrderList status="accepted"/>}
                            Completed={<OrderList status="completed"/>}
                            tabs={["Received", "Progress", "Completed"]}/>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default App

