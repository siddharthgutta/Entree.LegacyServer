import React from 'react';
import Influx from 'react-influx';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Header from './elements/Header';
import ModalManager from './modals/ModalManager';
import Dispatcher from '../../dispatchers/Dispatcher';
import Sidebar from './elements/Sidebar';
import {findDOMNode} from 'react-dom';
import {apply, onClick} from '../../../libs/utils';

class Board extends Influx.Component {
  static propTypes = {children: React.PropTypes.node, location: React.PropTypes.object};

  constructor(context, props) {
    super(context, props);

    this.lastUpdateTime = Date.now();
    this.menuActive = false;
  }

  shouldComponentUpdate() {
    const time = Date.now();

    if (time - this.lastUpdateTime < 300) {
      return false;
    }

    this.lastUpdateTime = time;

    return true;
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.MENU_VISIBILITY, this._setMenuVisibility]
    ];
  }

  _setMenuVisibility(visible) {
    const sidebar = findDOMNode(this.refs.sidebar);
    const node = findDOMNode(this);

    if (visible) {
      apply(node, {transform: `translate3d(${sidebar.offsetWidth}px, 0, 0)`});
    } else {
      apply(node, {transform: `translate3d(0, 0, 0)`});
    }

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.menuActive = visible, 500);
  }

  _handleMenuCollapse() {
    if (this.menuActive) {
      Dispatcher.emit(Dispatcher.Events.MENU_VISIBILITY, false);
    }
  }

  render() {
    return (
      <div className='full animate-transform flex vertical' {...onClick(() => this._handleMenuCollapse())}>
        <Sidebar ref='sidebar'/>
        <Header />
        <ModalManager />
        <div className='full'>
          <ReactCSSTransitionGroup
            component='div'
            className='full-abs board'
            transitionName='board'
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}>
            {React.cloneElement(this.props.children, {
              key: this.props.location.pathname
            })}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
}

export default Board;
