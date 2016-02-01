import React from 'react';
import {browserHistory, Router, Route, IndexRoute} from 'react-router';
import OrderHistory from './views/pages/OrderHistory';
import OrderFocus from './views/pages/OrderFocus';
import Board from './views/general/Board';
import Header from './views/elements/Header';
import Dispatcher from '../dispatchers/Dispatcher';

class App extends React.Component {
  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.CONNECT_STREAM);
  }

  render() {
    return (
        <div className='full flex vertical'>
          <Header />
          <Router history={browserHistory}>
            <Route path='/' component={Board}>
              <IndexRoute component={OrderHistory}/>
              <Route path='orders' component={OrderHistory}/>
              <Route path='order/:id' component={OrderFocus}/>
            </Route>
          </Router>
        </div>
    );
  }
}

export default App;
