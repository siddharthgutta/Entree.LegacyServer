import chalk from 'chalk';

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

export function deprecate(func, message = 'No deprecation warning!') {
  process.stdout.write(`${chalk.red('deprecated:')} ${chalk.yellow.bold(message)}\n`); // bypass scribe

  return func();
}
