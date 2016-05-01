import React from 'react';
import Influx from 'react-influx';
import {browserHistory, Router, Route, IndexRoute} from 'react-router';
import ActiveOrders from './views/pages/ActiveOrders';
import OrderHistory from './views/pages/OrderHistory';
import Login from './views/pages/Login';
import OrderFocus from './views/pages/OrderFocus';
import Board from './views/Board';
import {getPlatform} from '../../libs/env.es6';

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);
  }

  componentDidMount() {
    window.document.body.classList.add(getPlatform());
  }

  render() {
    return (
      <Router history={browserHistory}>
        <Route path='/' component={Board}>
          <IndexRoute component={Login}/>
          <Route path='login' component={Login}/>
          <Route path='orders' component={ActiveOrders}/>
          <Route path='history' component={OrderHistory}/>
          <Route path='order/:id' component={OrderFocus}/>
        </Route>
      </Router>
    );
  }
}

export default App;
