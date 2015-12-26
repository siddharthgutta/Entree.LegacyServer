import Influx from 'react-influx'
import React from 'react'
import {ifcat} from '../../libs/util'

class Header extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div className={ifcat(this.props.className, {header: true, black: this.props.black})}>{this.props.text}</div>
    )
  }
}

export default Header