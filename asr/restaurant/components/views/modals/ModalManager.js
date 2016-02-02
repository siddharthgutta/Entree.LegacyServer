import React from 'react';
import Influx from 'react-influx';
import _ from 'underscore';
import {ifcat} from '../../../libs/utils';
import Dispatcher from '../../../dispatchers/Dispatcher';

class ModalManager extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {comps: {}, visible: {}};
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
    this.setState({visible: {...this.state.visible, [name]: visible}});
  }

  render() {
    const {visible, comps} = this.state;
    const modals = _.map(comps, (modal, name) =>
        <div key={name} className={ifcat('full', {hide: !visible[name]})}>
          {React.cloneElement(modal, {hide: () => this._setModalVisibility(name, false)})}
        </div>);
    const active = _.reduce(visible, (show, shown) => show || shown);

    return (
        <div className={ifcat('full-abs vignette', {hide: !active})} style={{zIndex: 9999}}>{modals}</div>
    );
  }
}

export default ModalManager;
