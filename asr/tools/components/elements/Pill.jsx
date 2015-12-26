import Influx from 'react-influx'
import React from 'react'
import {ifcat} from '../../libs/util'

class Pill extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div className={ifcat(this.props.className, {pill: true})} style={this.props.style}>{this.props.text}</div>
    )
  }
}

export default Pill