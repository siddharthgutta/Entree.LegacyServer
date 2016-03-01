import React from 'react';
import Influx from 'react-influx';
import UserList from './views/UserList';
import Login from './views/Login';
import Chat from './views/Chat';

class App extends Influx.Component {

  render() {
    return (
      <div className='full flex'>
        <div className='box full user-list-wrapper'>
          <UserList />
        </div>
        <div className='box full'>
          <Chat />
        </div>
        <Login />
      </div>
    );
  }

}

export default App;
