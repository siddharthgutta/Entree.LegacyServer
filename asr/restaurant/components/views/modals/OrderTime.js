import React from 'react';
import {onClick, shake} from '../../../../libs/utils';

class OrderTime extends React.Component {

  static propTypes = {
    onSubmitTime: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    hide: React.PropTypes.func.isRequired,
    startTime: React.PropTypes.number.isRequired,
    cost: React.PropTypes.any
  };

  static defaultProps = {
    onSubmitTime: Function,
    onCancel: Function,
    hide: Function,
    startTime: 0,
    cost: 0
  };

  constructor(context, props) {
    super(context, props);

    this.state = {
      time: this.props.startTime
    };
  }

  _addTime(time) {
    this.setState({time: this.state.time + time});
  }

  _handleCancel() {
    const {onCancel, hide} = this.props;

    onCancel(this.state.time);
    hide();
  }

  _handleAccept() {
    const {onSubmitTime, hide} = this.props;
    let {time} = this.state;

    time = Number(time);

    if (isNaN(time) || time === 0) {
      return shake(this.refs.body);
    }

    onSubmitTime(time);
    hide();
  }

  _setTime(time) {
    this.setState({time: Math.abs(isNaN(time) ? 0 : Number(time))});
  }

  render() {
    return (
      <div className='modal-box center'>
        <div className='flex modal-header'>
          <div className='box flex center vertical' style={{padding: 15}}>
            <div className='value'>
              <div className='bubble icon dollar'/>
              {Number(this.props.cost).toFixed(2)}</div>
            <div className='desc'>TOTAL COST</div>
          </div>
        </div>
        <div className='body' ref='body'>
          <div className='desc bold normal' style={{marginBottom: 20}}>Select a preparation time</div>
          <div className='button navy flex center' {...onClick(() => this._addTime(1))}>
            <span className='icon add'/><span>&nbsp;1 Minutes</span>
          </div>
          <div className='button navy flex center' {...onClick(() => this._addTime(5))}>
            <span className='icon add'/><span>&nbsp;5 Minutes</span>
          </div>
          <div className='button navy flex center' {...onClick(() => this._addTime(15))}>
            <span className='icon add'/><span>&nbsp;15 Minutes</span>
          </div>
          <div className='desc' style={{marginBottom: 10}}>OR</div>
          <input type='number' placeholder='minutes' value={this.state.time} style={{paddingRight: 0}}
                 onChange={e => this._setTime(e.target.value)}/>
          <div className='button' {...onClick(() => this._handleAccept())}>submit
          </div>
        </div>
      </div>
    );
  }
}

export default OrderTime;
