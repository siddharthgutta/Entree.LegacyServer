import React from 'react';
import Influx from 'react-influx';
import {findDOMNode} from 'react-dom';
import {onClick, type} from '../../libs/utils';
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
    const node = findDOMNode(this.refs.phone);
    const phoneNumber = node.value;
    request.post(`/api/user/signup`)
        .send({phoneNumber})
        .end((err, res) => {
          if (err) alert(JSON.stringify(err)); // FIXME improve error handling
          else if (res.body.status) alert(res.body.message);
          alert(res.body.message); // FIXME for testing!
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
        <div className='full' style={{background: 'url(images/top.jpg)',
              backgroundPosition: '10% center', backgroundSize: 'cover'}}>
          <div className='flex center vertical animate-opacity' ref='brand' style={{width: '100%', height: '50%'}}>
            <div style={{background: 'url(images/logo2.png)', backgroundSize: 'cover',
            width: 195, height: 90}}/>
            <div style={{fontSize: 17, color: '#FFF', letterSpacing: '0'}}>Order Ahead with SMS</div>
          </div>
          <div ref='mobile' className='animate-transform'
               style={{padding: '15px 0', width: '100%', position: 'fixed', bottom: -400, left: 0, right: 0}}>
            <div className='animate-opacity' ref='icon'
                 style={{position: 'absolute', top: -60, height: 50, width: '100%', opacity: 0}}>
              <div style={{backgroundImage: 'url(images/logo2.png)', backgroundSize: 'cover',
              backgroundPosition: 'left center', height: 60, width: 45, margin: '0 auto'}}/>
            </div>
            <div ref='screen' style={{width: 325, margin: '0 auto', background: 'url(images/iphone-black.png)',
             maxWidth: 325, height: 665, maxHeight: 665, backgroundRepeat: 'no-repeat', backgroundSize: '100% auto',
             padding: '85px 22px'}}>
              <div className='flex vertical' style={{background: '#EEE', width: '100%', height: '68%',
              position: 'relative', borderRadius: 2, overflow: 'hidden'}}>
                <div style={{backgroundImage: 'url(images/header.jpg)', backgroundSize: '100% auto',
                backgroundPosition: 'center center', height: '20px', minHeight: '20px', maxHeight: '20px',
                backgroundRepeat: 'no-repeat'}}/>
                <Messenger messages={this.state.messages} me={me} them={them}/>
              </div>
            </div>
          </div>
          <div style={{background: '#000', boxShadow: '0 -10px 50px rgba(0,0,0,0.3)', zIndex: 10,
              padding: 0, position: 'fixed', left: 0, bottom: 0, overflow: 'hidden', right: 0}}>
            <div className='' style={{position: 'absolute', left: 0, top: -50, bottom: 0, right: 0,
            background: '#DDD', backgroundSize: 'cover', zIndex: 0}}/>
            <div className='full'>
              <input type='tel' ref='phone' className='input' placeholder='Your Phone Number'/>
              <div className='button' {...onClick(() => this._createUser())}><span style={{opacity: 0.7}}>TEXT</span>
                &nbsp;YOUR ORDER!
              </div>
            </div>
          </div>
        </div>
    );
  }

}

export default App;
