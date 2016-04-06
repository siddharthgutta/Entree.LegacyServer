import EventEmitter from 'events';

/**
 * Wrapper for addEventListener; fires events even after the first event is fired
 */

const emitter = new EventEmitter();
const events = {};

export function addStoredEventListener(event, callback) {
  if (events[event]) {
    callback();
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

/**
 * Notification strategy
 */

let notificationGranted = false;

export function notify(title, text) {
  if (window.cordova) {
    if (notificationGranted) {
      const sound = window.device.platform === 'Android' ? 'audio/bell.mp3' : 'file://beep.caf';
      const notification = {id: Date.now(), title, text, message: text, at: new Date(), sound};

      window.cordova.plugins.notification.local.schedule(notification);
    }
  } else {
    alert(`${title}: ${text}`);
  }
}

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
