import React from 'react'
import Influx from 'react-influx'
import OrderList from './views/OrderList.jsx'
import Dispatcher from '../dispatchers/Dispatcher'
import TabbedPane from './views/general/TabbedPane.jsx'

class App extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM);
  }

  render() {
    return (
        <div className="full">
          <TabbedPane spread={true}
                      Received={<OrderList status="received"/>}
                      Progress={<OrderList status="accepted"/>}
                      Completed={<OrderList status="completed"/>}
                      tabs={["Received", "Progress", "Completed"]}/>
        </div>
    )
  }
}

export default App

