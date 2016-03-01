import React from 'react';
import Influx from 'react-influx';

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);
  }

  render() {
    return (
      <div>
        <input />
        <input />
        <input />
      </div>
    );
  }

}

export default App;
