import React from 'react';
import Influx from 'react-influx';
import BrainTree from 'braintree-web';
import querystring from 'querystring';
import fetch from '../../libs/fetch.es6';
import Card from 'react-credit-card';
import InputElement from 'react-input-mask';

const Status = {
  OK: Symbol(),
  CLOSE: Symbol()
};

const noop = () => 0;

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {user: {}, expiry: '', number: ''};
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
      if (status === 500) {
        alert(message || 'Unable to update your profile. Try again');
        window.location.search = window.location.search.replace('nonce', 'void'); // void the previous nonce
        return;
      }

      this.setState({user: data.user, status: Status.CLOSE, message});
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
        <div className='header'>
          <div className='braintree'></div>
          <div className='paypal'></div>
          <div className='logo'></div>
          <div style={{display: 'inline-block', marginLeft: 15, position: 'relative', top: 5}}>
            <div style={{fontSize: 14, color: '#444', fontWeight: 'bold',
              textTransform: 'uppercase', letterSpacing: '1px'}}>
              Account
            </div>
            <div style={{fontSize: 12, color: '#AAA'}}>Secured by <b>Braintree</b> & <b>Paypal</b></div>
          </div>
        </div>
        <div className='full momentum' ref='wrapper' style={{overflow: 'scroll'}}>
          <div className='modal'>
            { status === Status.OK ?
              <form target='no-forward' id='payment-form' method='POST'
                    action={`api/v2/user/profile/${token || secret}`}>
                <div className='label'>Phone</div>
                <InputElement className='input disabled' name='phoneNumber' onChange={noop}
                             disabled mask='999-999-9999' value={`${user.phoneNumber}`}/>
                <div className='label'>Email</div>
                <input className='input' name='email' value={user.email}
                       onChange={e => this._handleUpdate('email', e.target.value)}/>
                <Card name={`${user.firstName || ''} ${user.lastName || ''}`}
                      expiry={this.state.expiry.replace(/\//g, '')}
                      number={this.state.number.replace(/\s/g, '')}
                      cvc={this.state.cvv}
                      focused={'name'}/>
                <div className='flex group' style={{marginTop: 15}}>
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
                <InputElement autoComplete='cc-number' className='input' data-braintree-name='number'
                             mask='9999 9999 9999 9999' placeholder='0000 0000 0000 0000' maskChar=' '
                             onChange={e => this.setState({number: e.target.value})} value={this.state.number || ''}/>
                <div className='label'>CSV</div>
                <InputElement autoComplete='cc-csc' className='input' data-braintree-name='cvv'
                             placeholder='CVV' mask='9999' maskChar=' '
                             onChange={e => this.setState({cvv: e.target.value})} value={this.state.cvv || ''}/>
                <div className='label'>Expiration</div>
                <InputElement autoComplete='cc-exp' className='input' data-braintree-name='expiration_date'
                             placeholder='MM/YY' mask='99/99' maskChar=' '
                             onChange={e => this.setState({expiry: e.target.value})} value={this.state.expiry || ''}/>
                <button className='button' type='submit' style={{margin: 0}}>
                  <span className='icon lock' style={{marginRight: 5}}/>Submit
                </button>
                <p className='info'>* We do not store your credit/debit card information on Entree's servers.
                  All payment information and transactions are handled by BrainTree (a PayPal company) in compliance
                  with PCI Security Standards.</p>
              </form> :
              <div>
                <div className='label normal' style={{textAlign: 'center'}}>{this.state.message}</div>
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
