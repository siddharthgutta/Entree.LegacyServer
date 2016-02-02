import React from 'react';

class OrderTime extends React.Component {

  static propTypes = {
    onAcceptTime: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    hide: React.PropTypes.func.isRequired,
    startTime: React.PropTypes.number.isRequired,
    cost: React.PropTypes.any
  };

  static defaultProps = {
    onAcceptTime: Function,
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
    const {onAcceptTime, hide} = this.props;

    onAcceptTime(this.state.time);
    hide();
  }

  _setTime(time) {
    this.setState({time: Math.abs(isNaN(time) ? 0 : Number(time))});
  }

  render() {
    return (
        <div className='dialog center'>
          <div className='box flex center vertical' style={{padding: 15}}>
            <div className='value'>{this.props.cost}</div>
            <div className='desc'>TOTAL COST</div>
          </div>
          <hr />
          <div className='desc bold normal' style={{marginBottom: 20}}>Select a preparation time</div>
          <div className='button navy flex center' onTouchTap={() => this._addTime(1)} onClick={() => this._addTime(1)}>
            <span className='icon add'/><span>&nbsp;1 Minutes</span>
          </div>
          <div className='button navy flex center' onTouchTap={() => this._addTime(5)} onClick={() => this._addTime(5)}>
            <span className='icon add'/><span>&nbsp;5 Minutes</span>
          </div>
          <div className='button navy flex center' onTouchTap={() => this._addTime(15)}
               onClick={() => this._addTime(15)}>
            <span className='icon add'/><span>&nbsp;15 Minutes</span>
          </div>
          <div className='desc' style={{marginBottom: 10}}>OR</div>
          <input type='number' placeholder='minutes' value={this.state.time}
                 onChange={e => this._setTime(e.target.value)}/>
          <div className='button' onClick={() => this._handleAccept()}
               onTouchTap={() => this._handleAccept()}>submit
          </div>
        </div>
    );
  }
}

export default OrderTime;
