import App from './components/App.js';
import React from 'react';
import {render} from 'react-dom';
import tapInject from 'react-tap-event-plugin';

tapInject();

render(<App />, document.getElementById('app'));
