import React from 'react';
import Influx from 'react-influx';
import {onClick} from '../../../../libs/utils';

class Sidebar extends Influx.Component {
  constructor(context, props) {
    super(context, props);

    this.state = {};
  }

  render() {
    return (
        <div className='sidebar flex vertical' style={{width: 300, height: '100%'}}>
          <div className='flex center vertical' style={{height: 200, minHeight: 200, width: '100%'}}>
            <div className='full blur' style={{position: 'absolute', backgroundImage: 'url(images/pluckers.jpg)',
            height: 400, width: '100%', top: 0, opacity: 0.5, zIndex: 0}}/>
            <div className='profile' style={{backgroundImage: 'url(images/pluckers.jpg)',
            backgroundSize: 'cover', width: 120, height: 120, borderRadius: 120, zIndex: 2}}/>
          </div>
          <div className='title'>Plucker's Wings</div>
          <div className='subtitle'>Austin, TX</div>
          <div className='flex median' style={{minHeight: 80, marginTop: 20}}>
            <div className='box flex center vertical'
                 style={{borderRight: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <div className='value'>
                <div className='bubble light icon dollar'/>
                1,453.50
              </div>
              <div className='desc'>MONTH INCOME</div>
            </div>
            <div className='box flex center vertical'>
              <div className='value'>94</div>
              <div className='desc'>MONTH ORDERS</div>
            </div>
          </div>
          <div className='full scroll scroll-y'>
            <div className='item'>HOME</div>
            <div className='item selected' {...onClick(() => this.context.history.push('/orders'))}>ORDERS</div>
            <div className='item'>ACCOUNT</div>
            <div className='item'>SIGN OUT</div>
          </div>
        </div>
    );
  }
}

export default Sidebar;
