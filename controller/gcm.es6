import PubSub from '../pubsub.es6';
import config from 'config';
import {Message, Sender, Notification} from 'node-xcs';

const key = config.get('Google.gcmApiKey');
const sender = config.get('Google.gcmSenderId');
let xcs;

const toXCSMessage = message => {
  if (message.mNotification) {
    const notification = new Notification(message.mNotification.mIcon);
    Object.assign(notification, message.mNotification);
    message.mNotification = notification;
  }

  const _message = new Message(message.mMessageId);
  Object.assign(_message, message);

  return _message;
};

PubSub.Slave.on('gcm-sender', (origin, data, respond) => respond(sender));

PubSub.Slave.on('gcm-sendNoRetry', (origin, {message, to}, respond) => {
  console.log('Sending (no retry) GCM');
  xcs.sendNoRetry(toXCSMessage(message), to, result => {
    console.log(result);
    respond(result);
  });
});

PubSub.Slave.on('gcm-send', (origin, {message, to}, respond) => {
  console.log('Sending GCM');
  xcs.send(toXCSMessage(message), to, result => {
    console.log(result);
    respond(result);
  });
});

function init() {
  if (xcs) {
    xcs.events.removeAllListeners('message');
    xcs.events.removeAllListeners('receipt');
    xcs.events.removeAllListeners('connected');
    xcs.events.removeAllListeners('disconnected');
    xcs.events.removeAllListeners('error');
    xcs.events.removeAllListeners('message-error');
    xcs.disconnect();
  }

  xcs = new Sender(sender, key);

  xcs.client.setMaxListeners(Number.MAX_SAFE_INTEGER);

  xcs.events.on('message', (messageId, from, data, category) => {
    console.log('GCM message', {messageId, from, data, category});
    PubSub.Slave.broadcast('gcm-message', {messageId, from, data, category});
  });

  xcs.events.on('receipt', (messageId, from, data, category) => {
    console.log('GCM receipt', {messageId, from, data, category});
    PubSub.Slave.broadcast('gcm-receipt', {messageId, from, data, category});
  });

  xcs.events.on('connected', () => {
    console.log('GCM connected');
    PubSub.Slave.broadcast('gcm-connected');
  });

  xcs.events.on('disconnected', () => {
    console.log('GCM disconnected');
    PubSub.Slave.broadcast('gcm-disconnected');
    init();
  });

  xcs.events.on('error', e => {
    console.log('GCM error', e);
    PubSub.Slave.broadcast('gcm-error', e);
  });

  xcs.events.on('message-error', message => {
    console.log('GCM message error', message);
    PubSub.Slave.broadcast('gcm-message-error', message);
  });
}

init();
