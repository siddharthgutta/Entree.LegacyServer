import React from 'react';
import Influx from 'react-influx';
import {findDOMNode} from 'react-dom';
import {apply} from '../../libs/utils';

class App extends Influx.Component {
  constructor(context, props) {
    super(context, props);
  }

  componentDidMount() {
    setTimeout(() => {
      const iphone = findDOMNode(this.refs.mobile);
      const video = findDOMNode(this.refs.video);
      apply(iphone, {transform: 'translate3d(0, -250px, 0)'});
      video.play();
    }, 2000);
  }

  render() {
    return (
        <div className='full' style={{background: 'url(images/top.jpg)',
              backgroundPosition: '10% center', backgroundSize: 'cover'}}>
          <div className='flex center vertical' style={{width: '100%', height: '50%'}}>
            <div style={{background: 'url(images/logo2.png)', backgroundSize: 'cover', width: 195, height: 90}}/>
            <div style={{fontSize: 17, color: '#FFF', letterSpacing: '1px'}}>Text For Your Food</div>
          </div>
          <div ref='mobile' className='animate-transform' style={{padding: 15, width: '100%'}}>
            <div ref='screen' style={{width: '100%', background: 'url(images/iphone-black.png)', height: 705,
            backgroundSize: '100% auto', padding: '85px 22px'}}>
              <div style={{background: '#FFF', width: '100%', height: '100%', position: 'relative', borderRadius: 5}}>
                <video ref='video' width='100%' loop>
                  <source src='videos/temp1.mp4' type='video/mp4'/>
                </video>
              </div>
            </div>
          </div>
          <div style={{background: '#000', boxShadow: '0 -10px 30px rgba(0,0,0,0.7)',
              padding: 25, position: 'fixed', left: 0, bottom: 0, overflow: 'hidden', right: 0}}>
            <div className='blur ' style={{position: 'absolute', left: 0, top: -50, bottom: 0, right: 0,
            background: 'url(images/top.jpg)', backgroundSize: 'cover', zIndex: 0}}></div>
            <div className='full'>
              <input type='tel' className='input' placeholder='Your number'/>
              <div className='button'><span style={{opacity: 0.5}}>HEY</span> ENTREE!</div>
            </div>
          </div>
        </div>
    );
  }

}

export default App;
