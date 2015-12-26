import Influx from 'react-influx'
import React from 'react'
import {ifcat} from '../../libs/util'

class Body extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <div className={ifcat(this.props.className, {body: true, black: this.props.black})}>
        {this.props.children}
      </div>
    )
  }
}

export default Body