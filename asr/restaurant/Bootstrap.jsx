import App from './components/App.jsx'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import FastClick from 'fastclick'

FastClick.attach(document.body);

render(<App />, document.getElementById('app'));