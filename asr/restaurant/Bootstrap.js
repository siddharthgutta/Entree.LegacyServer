import App from './components/App.js';
import React from 'react';
import {render} from 'react-dom';
import tapInject from 'react-tap-event-plugin';

if (/iPad|iPhone|iPod/.test(navigator.platform)) {
  tapInject();
}

render(<App />, document.getElementById('app'));
