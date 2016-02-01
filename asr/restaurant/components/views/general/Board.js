import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Board extends React.Component {
  static propTypes = {children: React.PropTypes.node, location: React.PropTypes.object};

  constructor(context, props) {
    super(context, props);
  }

  render() {
    return (
        <ReactCSSTransitionGroup
            component='div'
            className='full'
            transitionName='board'
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}>
          <div className='full-abs'>
            {React.cloneElement(this.props.children, {
              key: this.props.location.pathname
            })}
          </div>
        </ReactCSSTransitionGroup>
    );
  }
}

export default Board;
