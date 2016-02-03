import React from 'react';
import Influx from 'react-influx';
import UserList from './views/UserList';
import Chat from './views/Chat';
import Dispatcher from '../dispatchers/Dispatcher';

class App extends Influx.Component {

  componentDidMount() {
    Dispatcher.emit(Dispatcher.Events.CONNECT);
  }

  render() {
    return (
        <div className='full flex'>
          <div className='box full user-list-wrapper'>
            <UserList />
          </div>
          <div className='box full'>
            <Chat />
          </div>
        </div>
    );
  }

}

export default App;
