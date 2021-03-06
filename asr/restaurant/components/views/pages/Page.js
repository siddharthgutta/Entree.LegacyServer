import Influx from 'react-influx';
import Dispatcher from '../../../dispatchers/Dispatcher';
import _ from 'underscore';

class OrderFocus extends Influx.Component {
  componentDidMount() {
    super.componentDidMount();

    this.renderHeader();
    this._registerModals();
  }

  _registerModals() {
    this.modals = this.getModals();

    _.each(this.modals,
           (component, name) => {
             Dispatcher.emit(Dispatcher.Events.REGISTER_MODAL, name, component);
             Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, name, false);
           });
  }

  _unregisterModals() {
    _.each(this.modals,
           (component, name) => {
             Dispatcher.emit(Dispatcher.Events.MODAL_VISIBILITY, name, false);
           });
  }

  componentDidUpdate() {
    this.renderHeader();
    this._registerModals();
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    this._unregisterModals();
  }

  renderHeader() {
    // ignore
  }

  getModals() {
    return {};
  }
}

export default OrderFocus;
