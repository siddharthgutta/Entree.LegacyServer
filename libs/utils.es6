// falsey check; null | undefined
export function isNullOrUndefined(a) {
  return typeof a === 'undefined' || a === null;
}

// falsey check; exclusive of integer = 0
export function isEmpty(a) {
  return isNullOrUndefined(a) || (typeof a === 'string' && !a.trim().length);
}

export function ip(req) {
  try {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  } catch (e) {
    console.error(e);
  }
}
