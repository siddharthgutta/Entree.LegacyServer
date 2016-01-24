import React from 'react'
import Influx from 'react-influx'
import OrderList from './views/OrderList.jsx'
import Dispatcher from '../dispatchers/Dispatcher'

class App extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM);
  }

  render() {
    return (
        <div>
          <OrderList />
        </div>
    )
  }
}

export default App

