import React from 'react';
import Influx from 'react-influx';
import {findDOMNode} from 'react-dom';
import {onClick, type} from '../../libs/utils';
import fetch from '../../libs/fetch';
import Messenger from './../../components/Messenger';

const me = {
  number: 'A'
};

const them = {
  number: 'Entrée'
};

const conversation = [{
  from: 'A',
  to: 'Entrée',
  content: 'Hey Entrée!'
}, {
  from: 'Entrée',
  to: 'A',
  content: 'Hi. What are you in the mood for?'
}, {
  from: 'A',
  to: 'Entrée',
  content: '@starbucks 1 tall iced vanilla latte'
}, {
  from: 'Entrée',
  to: 'A',
  content: 'Great! Come pick it up in 5 minutes.'
}, {
  from: 'Entrée',
  to: 'A',
  content: 'Can I help you with anything else?'
}, {
  from: 'A',
  to: 'Entrée',
  content: 'Can I get my usual from Torchies?'
}, {
  from: 'Entrée',
  to: 'A',
  content: '2 Democrats coming right up! It\'ll be ready in 15 mins'
}];

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {
      messages: []
    };
  }

  _injectMessages() {
    const message = conversation.shift();
    const textarea = document.getElementsByTagName('textarea')[0];

    if (message) {
      const messages = this.state.messages;

      const next = () => {
        textarea.value = '';
        messages.push(message);
        this.setState({messages});
        this._injectMessages();
      };

      if (message.to === 'Entrée') {
        return setTimeout(() => type(textarea, message.content, 1000, () => next()), messages.length ? 1500 : 0);
      }

      setTimeout(() => next(), 1100);
    }
  }

  _createUser() {
    const DONE = 'done';

    if (this.block === DONE) {
      return alert('You should receive a text shortly');
    } else if (this.block) {
      return alert('Hang tight');
    }

    this.block = true;

    const node = findDOMNode(this.refs.phone);
    const phoneNumber = String(node.value).replace(/[^0-9]/g, '');

    fetch(`/api/v2/user/signup`, {method: 'post', body: {phoneNumber}})
    .then(res => {
      this.block = DONE;
      console2.tag('create-user').log(res.body);
      alert(res.body.message);
    })
    .catch(err => {
      this.block = false;
      console2.tag('create-user').error(err);
      alert(err.message);
    });
  }

  componentDidMount() {
    setTimeout(() => {
      const iphone = findDOMNode(this.refs.mobile);
      const brand = findDOMNode(this.refs.brand);
      const icon = findDOMNode(this.refs.icon);
      brand.style.opacity = 0;

      if (icon.getBoundingClientRect().top - 250 > 0) {
        icon.style.opacity = 1;
      }

      iphone.className += ' translate-up';
      setTimeout(() => this._injectMessages(), 1000);
    }, 2000);
  }

  render() {
    return (
      <div className='full background'>
        <a className='twitter' href='https://twitter.com/textentree'><span className='icon twitter'/></a>
        <a className='contact' href='mailto:hi@textentree.com'><span className='icon message2'/></a>
        <div className='flex center vertical animate-opacity' ref='brand' style={{width: '100%', height: '50%'}}>
          <div className='main-logo'/>
          <div className='catchphrase'>Order Ahead with SMS</div>
        </div>
        <div ref='mobile' className='animate-transform phone-wrapper'>
          <div className='animate-opacity secondary-logo-wrapper' ref='icon'>
            <div className='secondary-logo'/>
          </div>
          <div ref='screen' className='phone'>
            <div className='flex vertical viewport'>
              <div className='status-bar'/>
              <Messenger messages={this.state.messages} me={me} them={them}/>
            </div>
          </div>
        </div>
        <div className='modal'>
          <div className='input-wrapper'>
            <input type='tel' ref='phone' className='input' placeholder='Your Phone Number'/>
          </div>
          <div className='flex'>
            <div className='box button' {...onClick(() => this._createUser())}><span style={{opacity: 0.7}}>TEXT</span>
              &nbsp;YOUR ORDER!
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default App;
