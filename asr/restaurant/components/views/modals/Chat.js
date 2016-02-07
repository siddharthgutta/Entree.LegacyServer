import React from 'react';
import Chance from 'chance';
import _ from 'underscore';
import {findDOMNode} from 'react-dom';
import {onClick} from '../../../../libs/utils';

const chance = new Chance();

class Chat extends React.Component {

  static propTypes = {
    onConfirm: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    hide: React.PropTypes.func.isRequired,
    text: React.PropTypes.any,
    cost: React.PropTypes.any
  };

  static defaultProps = {
    onConfirm: () => 0,
    onCancel: () => 0,
    hide: () => 0,
    text: '',
    cost: 0
  };

  constructor(context, props) {
    super(context, props);

    const messages = [];
    for (let i = 0; i < 30; i++) {
      messages.push({
        text: chance.sentence(),
        time: chance.timestamp(),
        align: chance.pick(['left', 'right'])
      });
    }

    this.state = {messages};
  }

  componentDidMount() {
    const node = findDOMNode(this);
    node.parentNode.classList.add('full');
  }

  _setTime(time) {
    this.setState({time: Math.abs(isNaN(time) ? 0 : Number(time))});
  }

  render() {
    const messages = _.map(this.state.messages, (message, i) =>
        <div key={i} className={`message ${message.align}`}>
          <div className='text'>{message.text}</div>
        </div>
    );

    return (
        <div className='modal-box center full'>
          <div className='full flex vertical'>
            <div className='flex modal-header'>
              <div {...onClick(() => this.props.hide())} className='flex center vertical nav-left evil-icon back'/>
              <div className='box flex right vertical flex right vertical' style={{alignItems: 'flex-end'}}>
                <div className='desc'>SMS</div>
                <div className='value' style={{fontSize: 25}}>Siddarth Gutta</div>
              </div>
              <div className='box ' style={{height: 50, width: 60, maxWidth: 60, minWidth: 60}}>
                <div className='flex center vertical profile'>
                  SG
                </div>
              </div>
            </div>
            <div className='full momentum' style={{flex: 1, overflowY: 'scroll',
              padding: 15, paddingRight: 10}}>{messages}</div>
            <input className='stretch' placeholder='Your message'/>
          </div>
        </div>
    );
  }
}

export default Chat;
