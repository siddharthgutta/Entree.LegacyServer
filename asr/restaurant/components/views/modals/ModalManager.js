import React from 'react';
import Influx from 'react-influx';
import Dispatcher from '../../../dispatchers/Dispatcher';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class ModalManager extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {comps: {}, visible: null};
  }

  getListeners() {
    return [
      [Dispatcher, Dispatcher.Events.REGISTER_MODAL, this._registerModal],
      [Dispatcher, Dispatcher.Events.MODAL_VISIBILITY, this._setModalVisibility]
    ];
  }

  _registerModal(name, modal) {
    this.setState({comps: {...this.state.comps, [name]: modal}});
  }

  _setModalVisibility(name, visible) {
    this.setState({visible: visible ? name : null});
  }

  render() {
    const {visible, comps} = this.state;
    const modals = [];

    if (visible && comps[visible]) {
      const component = comps[visible];
      modals.push(
          <div key={visible} className='full'>
            <div className='full-abs' style={{zIndex: 1}} onTouchTap={() => this._setModalVisibility(visible, false)}
                 onClick={() => this._setModalVisibility(visible, false)}/>
            <div className='modal-wrapper'>
              {React.cloneElement(component, {hide: () => this._setModalVisibility(visible, false)})}
            </div>
          </div>
      );
    }

    return (
        <ReactCSSTransitionGroup
            className='vignette modal'
            transitionName='modal'
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}>
          {modals}
        </ReactCSSTransitionGroup>
    );
  }
}

export default ModalManager;
