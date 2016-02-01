/**
 * IMPORTANT: Must return promises!
 */

export function create(username, password) {
  return new Promise(resolve => {
    resolve('unimplemented', username, password);
  });
}

export function destroy(token) {
  return new Promise(resolve => {
    resolve('unimplemented', token);
  });
}

export function status(token) {
  return new Promise(resolve => {
    resolve('unimplemented', token);
  });
}
