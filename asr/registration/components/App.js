import React from 'react';
import Influx from 'react-influx';
import {findDOMNode} from 'react-dom';
import {onClick, type, log} from '../../libs/utils';
import Messenger from './../../components/Messenger';
import request from 'superagent';

const me = {
  number: 'A'
};

const them = {
  number: 'Entree'
};

const conversation = [{
  from: 'A',
  to: 'Entree',
  content: 'Hey Entree!'
}, {
  from: 'Entree',
  to: 'A',
  content: 'Hi. What would you like to order?'
}, {
  from: 'A',
  to: 'Entree',
  content: '@starbucks 1 vanilla latte ice'
}, {
  from: 'Entree',
  to: 'A',
  content: 'Great! Come pick it up in 5 minutes.'
}, {
  from: 'Entree',
  to: 'A',
  content: 'Can I help you with anything else?'
}, {
  from: 'A',
  to: 'Entree',
  content: 'Hmmm. My usual from Torchies?'
}, {
  from: 'Entree',
  to: 'A',
  content: 'Ok. 2 Democrats coming right up! It\'ll be ready in 15 mins'
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

      if (message.to === 'Entree') {
        return setTimeout(() => type(textarea, message.content, 1000, () => next()), messages.length ? 1500 : 0);
      }

      setTimeout(() => next(), 1100);
    }
  }

  _createUser() {
    if (this.block === 'DONE') {
      return alert('You should receive a text shortly');
    } else if (this.block) {
      return alert('Hang tight');
    }

    this.block = true;

    const node = findDOMNode(this.refs.phone);
    const phoneNumber = node.value;

    request.post(`/api/user/signup`)
        .withCredentials()
        .send({phoneNumber})
        .end((err, res) => {
          if (err) {
            log(['api', 'call'], err);
            alert(JSON.stringify(err));
            this.block = false;
          } else if (res.body.status) {
            log(['api', 'call'], res.body);
            alert(res.body.message);
            this.block = false;
          } else {
            alert(res.body.message); // FIXME for testing!
            this.block = 'DONE';
          }
        });
  }

  componentDidMount() {
    setTimeout(() => {
      const iphone = findDOMNode(this.refs.mobile);
      const brand = findDOMNode(this.refs.brand);
      const icon = findDOMNode(this.refs.icon);
      brand.style.opacity = 0;
      icon.style.opacity = 1;
      iphone.className += ' translate-up';
      setTimeout(() => this._injectMessages(), 1000);
    }, 2000);
  }

  render() {
    return (
        <div className='full background'>
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
            <div className='button' {...onClick(() => this._createUser())}><span style={{opacity: 0.7}}>TEXT</span>
              &nbsp;YOUR ORDER!
            </div>
          </div>
        </div>
    );
  }

}

export default App;
