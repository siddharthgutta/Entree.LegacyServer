import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from 'underscore';
import {findDOMNode} from 'react-dom';
import {ifcat, scrollTo} from '../../../libs/utils';
import TextArea from 'react-textarea-autosize';

const ANIMATION_TIME = 500;

class Messages extends React.Component {

  static propTypes = {
    messages: React.PropTypes.array,
    me: React.PropTypes.object,
    them: React.PropTypes.object,
    insertMessage: React.PropTypes.func
  };

  constructor(context, props) {
    super(context, props);
  }

  componentDidMount() {
    setTimeout(() => this._forceToBottom(), ANIMATION_TIME);
  }

  componentDidUpdate() {
    // force to bottom
    setTimeout(() => this._forceToBottom(), ANIMATION_TIME);
  }

  _forceToBottom() {
    const scroll = findDOMNode(this.refs.scroll);
    scrollTo(scroll, scroll.scrollHeight, 200);
  }

  _handleEnter(e) {
    const node = findDOMNode(this.refs.text);
    const text = node.value.trim();
    if (e.keyCode === 13 && text && !e.shiftKey) {
      this.props.insertMessage(text);
      node.value = null;
    }
  }

  _changeInputHeight(height) {
    const node = findDOMNode(this.refs.base);

    height = height + 10 + 1; // padding + border
    node.style.minHeight = `${height}px`;
    node.style.maxHeight = `${height}px`;
    node.style.height = `${height}px`;
  }

  render() {
    const {me, them} = this.props;
    const messages = _.map(this.props.messages, (msg, i, arr) => {
      const from = me.number === msg.from;
      const last = arr.length === i + 1;
      return (
          <div key={i + them.number} className={ifcat({me: from, them: !from})}>
            <div style={{marginBottom: last ? 0 : null}}
                 className={ifcat('message', {'from-me': from, 'from-them': !from})} key={i}>
              <p>{msg.content}</p>
            </div>
            { last ? null : <div className='clear'/> }
          </div>
      );
    });

    return (
        <div className='flex full vertical'>
          <div className='message-head flex'>
            <div className='box left'><span className='evil-icon back'/>Messages</div>
            <div className='box center'>{them.number}</div>
            <div className='box right'>Details</div>
          </div>
          <ReactCSSTransitionGroup
              component='section'
              ref='scroll'
              className='messages full scy momentum'
              transitionName='messages'
              transitionAppear
              transitionAppearTimeout={ANIMATION_TIME}
              transitionEnterTimeout={ANIMATION_TIME}
              transitionLeave={false}>
            {messages}
          </ReactCSSTransitionGroup>
          <div className='input' ref='base'>
            <TextArea ref='text' placeholder='Text Message' onHeightChange={height => this._changeInputHeight(height)}
                      useCacheForDOMMeasurements onKeyDown={e => this._handleEnter(e)}/>
          </div>
        </div>
    );
  }
}

export default Messages;
