import React from 'react'
import Influx from 'react-influx'

class App extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div>Whats up!</div>
    )
  }
}

export default App

