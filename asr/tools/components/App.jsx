import config from 'config'
import Influx from 'react-influx'
import React from 'react'
import Chat from './views/Chat.jsx'
import Body from './elements/Body.jsx'
import Header from './elements/Header.jsx'
import Pill from './elements/Pill.jsx'
import fs from 'fs'
import _ from 'underscore'
import deps from '../../../deps.json'
import Dispatcher from '../Dispatcher'

console.log(config) && console.log(config.get('Client.testProperty')); // prints `hello!` // FIXME

class App extends Influx.Component {
  constructor(...args) {
    super(...args);
  }

  componentDidMount() {
    const args = ["my", "args", "go", "here"];
    Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM, ...args); // using spread
  }

  render() {
    return (
      <div className="flex full">
        <div className="full">
          <Chat/>
        </div>
        <div className="full" style={{width:'40%'}}>
          <div className="flex full vertical">
            <Header text="Dependencies"/>
            <Body className="full">{_.map(deps, (d, i) => <Pill key={i} text={d.name}/>)}</Body>
          </div>
        </div>
      </div>
    )
  }
}

export default App

