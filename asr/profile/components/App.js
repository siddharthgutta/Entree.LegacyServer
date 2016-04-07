import React from 'react';
import Influx from 'react-influx';
import BrainTree from 'braintree-web';
import querystring from 'querystring';
import fetch from '../../libs/fetch';

const Status = {
  OK: Symbol(),
  CLOSE: Symbol()
};

const noop = () => 0;

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {user: {}};
    this.params = querystring.parse(window.location.search.substring(1));
  }

  async initBraintreeUI() {
    const {body: {data: {clientToken}}} =
      await fetch(`/api/v2/user/client-token`);
    // @bluejamesbond Use this to debug the front end
    // Each time, a new client token needs to be retrieved
    // for each individual payment. Every single time
    // different payment info is put in, a new client token
    // and a new BrainTree.setup should be executed
    /*
    console.log(`Fetched ${clientToken}`);
    */
    BrainTree.setup(clientToken, 'custom', {
      id: 'payment-form'
    });
  }

  async componentWillMount() {
    try {
      const {token, secret} = this.params;
      const {body: {data: {user}}} =
        await fetch(`/api/v2/user/profile/${token || secret}`);

      this.setState({user, status: Status.OK});

      this.initBraintreeUI();
    } catch (e) {
      this.setState({status: Status.CLOSE, message: 'Your session has expired'});
    }
  }

  _handleResult() {
    const frame = this.refs.frame;

    try {
      const {status, data, message} = JSON.parse(frame.contentWindow.document.body.innerText);
      if (status === 200) {
        this.setState({status: Status.CLOSE, message});
        return;
      } else if (status === 500) {
        alert(message || 'Unable to update your profile');
        window.location.reload();
        return;
      }

      this.setState({user: data.user});

      alert(message);
    } catch (e) {
      throw Error(`Could not parse JSON: ${e.message}`);
    }
  }

  _handleUpdate(key, value) {
    const user = this.state.user;
    user[key] = value;
    this.setState({user});
  }

  render() {
    const {user} = this.state;
    const {status} = this.state;
    const {token, secret} = this.params;

    return (
      <div className='full' ref='root' style={{position: 'fixed', left: 0, top: 0, zIndex: 999}}>
        <div className='full-abs' style={{background: 'rgba(232,232,232,0.8)'}}/>
        <div className='full' ref='wrapper' style={{overflow: 'scroll'}}>
          <div className='modal'>
            { status === Status.OK ?
              <form target='no-forward' id='payment-form' method='POST'
                    action={`api/v2/user/profile/${token || secret}`}>
                <input className='input disabled' name='phoneNumber' onChange={noop} disabled value={user.phoneNumber}/>
                <div className='label'>Email</div>
                <input className='input' name='email' value={user.email}
                       onChange={e => this._handleUpdate('email', e.target.value)}/>
                <div className='section'>
                  <div className='flex group'>
                    <div className='box item'>
                      <div className='label'>First Name</div>
                      <input className='input' name='firstName' value={user.firstName}
                             onChange={e => this._handleUpdate('firstName', e.target.value)}/>
                    </div>
                    <div className='box item'>
                      <div className='label'>Last Name</div>
                      <input className='input' name='lastName' value={user.lastName}
                             onChange={e => this._handleUpdate('lastName', e.target.value)}/>
                    </div>
                  </div>
                  <input hidden data-braintree-name='cardholder_name' onChange={noop}
                         value={`${user.first || ''} ${user.last || ''}`}/>
                  <div className='label'>Card Number</div>
                  <input className='input' data-braintree-name='number' placeholder='0000 0000 0000 0000'/>
                  <div className='label'>CSV</div>
                  <input className='input' data-braintree-name='cvv' placeholder='123'/>
                  <div className='label'>Expiration</div>
                  <input className='input' data-braintree-name='expiration_date' placeholder='MM/YY'/>
                </div>
                <button className='button' type='submit' style={{margin: 0}}>Submit</button>
              </form> :
              <div>
                <div className='label' style={{textAlign: 'center'}}>{this.state.message}</div>
              </div>
            }
            <iframe ref='frame' onLoad={() => this._handleResult()}
                    name='no-forward' id='braintree-target' className='hide'/>
          </div>
        </div>
      </div>
    );
  }

}

export default App;
