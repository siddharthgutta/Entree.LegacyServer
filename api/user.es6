import User from '../models/mysql/user.es6';

/**
 * IMPORTANT: Must return promises!
 */

export function create(username, email, password, other) {
  return User.sync().then(()=> User.create({username, email, password}));
}

export function destroy(username, password) {
  return new Promise((resolve, reject) => {
    resolve("unimplemented");
  });
}