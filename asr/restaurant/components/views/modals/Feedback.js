import React from 'react';
import {onClick} from '../../../../libs/utils';

class Feedback extends React.Component {

  static propTypes = {
    onSendFeedback: React.PropTypes.func.isRequired,
    hide: React.PropTypes.func.isRequired,
    text: React.PropTypes.any,
    cost: React.PropTypes.any
  };

  static defaultProps = {
    onSendFeedback: Function,
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
    const {onSendFeedback, hide} = this.props;

    onSendFeedback(this.state.message);
    hide();
  }

  render() {
    return (
      <div className='modal-box center'>
        <div className='flex modal-header'>
          <div className='box flex center vertical' style={{padding: 5}}>
            <div className='desc'>FEEDBACK & CONCERNS</div>
          </div>
        </div>
        <div className='body'>
          <div className='desc bold normal' style={{margin: 20}}>Let us know what you are thinking</div>
          <div style={{padding: 20, paddingTop: 0}}>
          <textarea placeholder='Your message' value={this.state.message}
                    onChange={e => this.setState({message: e.target.value})}/>
          </div>
          <div className='button teal' {...onClick(() => this._handleDecline())}>send feedback
          </div>
        </div>
      </div>
    );
  }
}

export default Feedback;
