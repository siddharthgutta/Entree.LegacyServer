import prefix from 'react-prefixr';
import tapInject from 'react-tap-event-plugin';
import './rAF';

export function ifcat(base, obj) {
  let res = '';
  if (arguments.length > 1) {
    res = `${base} `;
  } else {
    obj = base;
  }

  for (const [cls, pred] of Object.entries(obj)) {
    if (pred) res += ` ${cls}`;
  }

  return res;
}

export function ifel(predicate, b, c) {
  return !!predicate ? b : c;
}

export function pre(o) {
  return prefix(o);
}

export function apply(elem, styles) {
  for (const [prop, val] of Object.entries(styles)) {
    elem.style[prop] = val;
  }
}

export const IS_IOS = /iPad|iPhone|iPod/.test(navigator.platform);

export function useTouchEventsForClick() {
  if (IS_IOS) {
    tapInject();
  }
}

export function onClick(a) {
  return IS_IOS ? {onTouchTap: a} : {onClick: a};
}

// WARNING doesn't deal with repeat calls
export function scrollTo(element, to, duration) {
  if (duration <= 0) return;
  const difference = to - element.scrollTop;
  const perTick = difference / duration * 10;

  function step() {
    element.scrollTop = element.scrollTop + perTick;
    if (element.scrollTop === to) return;
    scrollTo(element, to, duration - 10);
  }

  setTimeout(() => window.requestAnimationFrame(step), 10);
}

export function type(node, text, time, then) {
  const letters = text.split('');
  let id;

  node.value = '';

  id = setInterval(() => {
    if (!letters.length) {
      clearInterval(id);
      return then();
    }

    const letter = letters.shift();
    node.value = node.value + letter;
  }, time / letters.length);
}
