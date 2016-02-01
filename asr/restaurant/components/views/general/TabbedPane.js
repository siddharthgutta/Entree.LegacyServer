import React from 'react';
import Influx from 'react-influx';
import ReactDOM from 'react-dom';
import _ from 'underscore';

function setVendorSpecificStyles(element, property, propertyCased, value) {
  element.style['webkit' + property] = value;
  element.style['moz' + property] = value;
  element.style['ms' + property] = value;
  element.style['o' + property] = value;
  element.style[propertyCased] = value;
}


class TabbedPane extends Influx.Component {

  constructor(...args) {
    super(...args);

    this.state = {[this.props.tabs[0]]: true};
    this.activeTab = this.props.tabs[0];
  }

  _showTab(tab) {
    var index = this.props.tabs.indexOf(tab);
    if (index > -1) {
      if (this.activeTab) {
        var activeTab = this.refs['button' + this.activeTab];
        activeTab.classList.remove('selected');
      }

      var nextTab = ReactDOM.findDOMNode(this.refs['button' + tab]);
      nextTab.classList.add('selected');
      setVendorSpecificStyles(ReactDOM.findDOMNode(this.refs.pane), 'Transform',
          'transform', 'translate3d(-' + (index / this.props.tabs.length * 100) + '%, 0, 0)');
      this.activeTab = tab;

      if (this.props.onChange) {
        this.props.onChange(tab);
      }

      if (!this.state[tab]) {
        var state = {};
        state[tab] = true;
        this.setState(state);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (Array.isArray(nextProps.tabs) && nextProps.tabs.length && nextProps.tabs.indexOf(this.activeTab) === -1) {
      this.activeTab = nextProps.tabs[0];
    }
  }

  componentDidMount() {
    this._showTab(this.activeTab);
  }

  componentDidUpdate() {
    this._showTab(this.activeTab);
  }

  render() {
    var count = this.props.tabs.length;
    var children = this.props.tabs.map(tab => {
      return (
          <div key={tab} ref={tab}
               style={{height:'100%', display:'inline-block', verticalAlign:'top',
             width:(1 / count * 100) + '%', overflow:'hidden', position:'relative'}}>
            {this.state[tab] ? this.props[tab] : null}</div>
      );
    });

    var tabs = this.props.tabs.map(tab => {
      return (
          <div key={tab} onTouchTap={this._showTab.bind(this, tab)} onClick={this._showTab.bind(this, tab)}
               className={'tab ' + (this.props.spread ? 'box' : null)} ref={'button' + tab}>{tab}</div>
      );
    });

    var style = this.props.style || {};
    style.position = 'relative';
    style.overflow = 'hidden';

    return (
        <div className='full flex vertical'>
          <div className={'tabs ' + (this.props.spread ? 'spread flex' : null)}>{tabs}</div>
          <div className='full' style={style}>
            <div className='full-abs animate' ref='pane'
                 style={{width:count * 100 + '%'}}>{children}</div>
          </div>
        </div>
    );
  }
}

export default TabbedPane;