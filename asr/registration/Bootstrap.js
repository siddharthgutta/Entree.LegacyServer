import 'es6-symbol/implement';
import '../libs/onerror';
import App from './components/App.js';
import React from 'react';
import {render} from 'react-dom';
import {useTouchEventsForClick} from '../libs/utils';

useTouchEventsForClick();

render(<App />, document.getElementById('app'));
