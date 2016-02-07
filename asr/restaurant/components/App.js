import React from 'react';
import Influx from 'react-influx';
import {browserHistory, Router, Route, IndexRoute} from 'react-router';
import OrderHistory from './views/pages/OrderHistory';
import OrderFocus from './views/pages/OrderFocus';
import Board from './views/Board';
import Dispatcher from '../dispatchers/Dispatcher';

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);
  }

  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM);
  }

  render() {
    return (
        <Router history={browserHistory}>
          <Route path='/' component={Board}>
            <IndexRoute component={OrderHistory}/>
            <Route path='orders' component={OrderHistory}/>
            <Route path='order/:id' component={OrderFocus}/>
          </Route>
        </Router>
    );
  }
}

export default App;
