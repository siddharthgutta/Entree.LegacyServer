import React from 'react';
import Influx from 'react-influx';
import ReactDOM from 'react-dom';
import {apply, ifcat, onClick} from '../../../../libs/utils';

class TabbedPane extends Influx.Component {

  static defaultProps = {
    style: {},
    spread: true
  };

  static propTypes = {
    onChange: React.PropTypes.func,
    spread: React.PropTypes.bool,
    style: React.PropTypes.object.isRequired
  };

  constructor(...args) {
    super(...args);

    this.state = {[this.props.tabs[0]]: true};
    this.active = this.props.tabs[0];
  }

  _showTab(tab) {
    const index = this.props.tabs.indexOf(tab);

    if (index > -1) {
      if (this.active) {
        const active = this.refs[`button${this.active}`];
        active.classList.remove('selected');
      }

      const next = ReactDOM.findDOMNode(this.refs[`button${tab}`]);
      next.classList.add('selected');

      apply(ReactDOM.findDOMNode(this.refs.pane),
          {transform: `translate3d(-${index / this.props.tabs.length * 100}%, 0, 0)`});

      this.active = tab;

      if (this.props.onChange) {
        this.props.onChange(tab);
      }

      if (!this.state[tab]) {
        this.setState({[tab]: true});
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (Array.isArray(nextProps.tabs) && nextProps.tabs.length
        && nextProps.tabs.indexOf(this.active) === -1) {
      this.active = nextProps.tabs[0];
    }
  }

  componentDidMount() {
    this._showTab(this.active);
  }

  componentDidUpdate() {
    this._showTab(this.active);
  }

  render() {
    const count = this.props.tabs.length;
    const children = this.props.tabs.map(tab =>
        <div key={tab} ref={tab}
             style={{height: '100%', display: 'inline-block', verticalAlign: 'top',
             width: `${(1 / count * 100)}%`, overflow: 'hidden', position: 'relative'}}>
          {this.state[tab] ? this.props[tab] : null}</div>
    );

    const tabs = this.props.tabs.map(tab =>
        <div key={tab} {...onClick(() => this._showTab(tab))} className={ifcat('tab', {box: this.props.spread})}
             ref={`button${tab}`}>{tab}</div>
    );

    const style = {...this.props.style, ...{position: 'relative', overflow: 'hidden'}};

    return (
        <div className='full flex vertical'>
          <div className={ifcat('tabs', {'spread flex': this.props.spread})}>{tabs}</div>
          <div className='full' style={style}>
            <div className='full-abs animate' ref='pane'
                 style={{width: `${count * 100}%`}}>{children}</div>
          </div>
        </div>
    );
  }
}

export default TabbedPane;
