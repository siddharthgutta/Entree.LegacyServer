import EventEmitter from 'events';

/**
 * Wrapper for addEventListener; fires events even after the first event is fired
 */

const emitter = new EventEmitter();
const events = {};
let notifySound;

export function addStoredEventListener(event, callback) {
  if (events[event]) {
    return callback();
  }

  emitter.once(event, callback, false);
}

window.document.addEventListener('deviceready', () => {
  events.deviceready = true;
  emitter.emit('deviceready');
}, false);

window.document.addEventListener('resume', () => {
  events.resume = true;
  emitter.emit('resume');
}, false);

window.document.addEventListener('DOMContentLoaded', () => {
  notifySound = window.document.createElement('audio');
  notifySound.innerHTML = '<source src="audio/bell.mp3" type="audio/mpeg"/>';
  window.document.body.appendChild(notifySound);
  events.DOMContentLoaded = true;
  emitter.emit('DOMContentLoaded');
}, false);

/**
 * Notification strategy
 */

let notificationGranted = false;

window.document.addEventListener('deviceready', () => {
  if (window.cordova) {
    window.cordova.plugins.notification.local.hasPermission(granted => {
      if (!granted) {
        return window.cordova
                     .plugins.notification.local.registerPermission(_granted => notificationGranted = _granted);
      }

      notificationGranted = granted;
    });
  }
});

/**
 * Background mode
 */

export function setBackground(enable) {
  if (window.cordova) {
    addStoredEventListener('deviceready', () => window.cordova.plugins.backgroundMode[enable ? 'enable' : 'disable']());

    if (enable) {
      window.cordova.plugins.backgroundMode.setDefaults({text: 'Background mode'});
    }
  }
}

export function getPlatform() {
  if (window.cordova) {
    return window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? 'ios' : 'android';
  }
}

window.getPlatform = getPlatform;

export function isNative() {
  return !!window.cordova;
}


export function notify(title, text, sound = true) {
  if (window.cordova) {
    if (notificationGranted) {
      const notification = {
        id: Date.now(),
        title,
        text,
        message: text,
        at: new Date()
      };

      window.cordova.plugins.notification.local.schedule(notification);

      if (sound && getPlatform() === 'ios') {
        notifySound.play();
      }
    }
  } else {
    alert(`${title}: ${text}`);
  }
}
