import React from 'react';
import {onClick} from '../../../../libs/utils';

class OrderDecline extends React.Component {

  static propTypes = {
    onDecline: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    hide: React.PropTypes.func.isRequired,
    text: React.PropTypes.any,
    cost: React.PropTypes.any
  };

  static defaultProps = {
    onDecline: Function,
    onCancel: Function,
    hide: Function,
    text: '',
    cost: 0
  };

  constructor(context, props) {
    super(context, props);

    this.state = {
      message: ''
    };
  }

  _handleDecline() {
    const {onDecline, hide} = this.props;

    onDecline(this.state.message);
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
                {this.props.cost}</div>
              <div className='desc'>TOTAL COST</div>
            </div>
          </div>
          <div className='body'>
            <div className='desc bold normal' style={{marginBottom: 20}}>Why are you declining?</div>
            <textarea placeholder='Your message' value={this.state.message}
                      onChange={e => this.setState({message: e.target.value})}/>
            <div className='button red' {...onClick(() => this._handleDecline())}>decline order
            </div>
          </div>
        </div>
    );
  }
}

export default OrderDecline;