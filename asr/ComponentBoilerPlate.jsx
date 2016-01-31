import Influx from 'react-influx'
import React from 'react'

class ComponentName extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  getListeners() {
    return [];
  }

  render() {
    return (
      <div></div>
    );
  }
}

export default ComponentName