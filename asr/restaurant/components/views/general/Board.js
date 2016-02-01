import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Board extends React.Component {
  static propTypes = {children: React.PropTypes.node, location: React.PropTypes.object};

  constructor(context, props) {
    super(context, props);
  }

  render() {
    return (
        <div className='full'>
          <ReactCSSTransitionGroup
              component='div'
              className='full-abs board'
              transitionName='board'
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}>
            {React.cloneElement(this.props.children, {
              key: this.props.location.pathname
            })}
          </ReactCSSTransitionGroup>
        </div>
    );
  }
}

export default Board;
