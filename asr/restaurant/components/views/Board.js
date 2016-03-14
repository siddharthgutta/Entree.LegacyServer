import React from 'react';
import Influx from 'react-influx';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Header from './elements/Header';
import ModalManager from './modals/ModalManager';
import Dispatcher from '../../dispatchers/Dispatcher';
import {Status} from '../../stores/OrderStore';
import Sidebar from './elements/Sidebar';
import {findDOMNode} from 'react-dom';
import {apply, onClick, pre} from '../../../libs/utils';

class Board extends Influx.Component {
  static propTypes = {
    children: React.PropTypes.node,
    location: React.PropTypes.object,
    history: React.PropTypes.object
  };

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
      [Dispatcher, Dispatcher.Events.MENU_VISIBILITY, this._setMenuVisibility],
      [Dispatcher, Dispatcher.Events.CONNECTION_STATUS, this._handleConnectionStatus]
    ];
  }

  _handleConnectionStatus(status) {
    const {history} = this.props;

    if (Status.DISCONNECTED === status) {
      history.push('/');
      return this._setMenuVisibility(false);
    }
  }

  _setMenuVisibility(visible) {
    const sidebar = findDOMNode(this.refs.sidebar);
    const node = findDOMNode(this);

    if (visible === true) {
      apply(node, pre({transform: `translate3d(${sidebar.offsetWidth}px, 0, 0)`}));
    } else if (visible === false) {
      apply(node, pre({transform: `translate3d(0, 0, 0)`}));
    } else {
      return this._setMenuVisibility(!this.menuActive);
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
      <div className='full animate-transform flex vertical'>
        <Sidebar ref='sidebar'/>
        <Header />
        <ModalManager />
        <div className='full' style={{overflow: 'hidden'}} {...onClick(() => this._handleMenuCollapse())}>
          <ReactCSSTransitionGroup
            component='div'
            className='full-abs board'
            transitionName='board'
            transitionEnterTimeout={333}
            transitionLeaveTimeout={333}>
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
