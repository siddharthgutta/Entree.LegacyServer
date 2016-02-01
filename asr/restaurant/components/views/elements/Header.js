import React from 'react';
import Influx from 'react-influx';

class Header extends Influx.Component {
  static propTypes = {
    style: React.PropTypes.object,
    title: React.PropTypes.string,
    subtitle: React.PropTypes.string,
    children: React.PropTypes.node
  };

  constructor(context, props) {
    super(context, props);
  }

  render() {
    return (
        <div className='header' style={this.props.style}>
          <div className='nav flex'>
            <div className='box flex center vertical evil-icon back nav-left'/>
            <div className='text' style={{flex: 1}}>
              <div className='title'>{this.props.title}</div>
              <div className='subtitle'>{this.props.subtitle}</div>
            </div>
            <div className='nav-right'/>
          </div>
          {this.props.children}
        </div>
    );
  }
}

export default Header;
