import chalk from 'chalk';
import {SourceMapConsumer} from 'source-map';
import fs from 'fs';

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

export class TraceError extends Error {
  constructor(message, ...causes) {
    super(message);

    const stack = Object.getOwnPropertyDescriptor(this, 'stack');

    Object.defineProperty(this, 'stack', {
      get: () => {
        const stacktrace = stack.get.call(this);
        let causeStacktrace = '';

        for (const cause of causes) {
          if (cause.sourceStack) { // trigger lookup
            causeStacktrace += `\n${cause.sourceStack}`;
          } else if (cause instanceof Error) {
            causeStacktrace += `\n${cause.stack}`;
          } else {
            causeStacktrace += `\n${cause}`;
          }
        }

        causeStacktrace = causeStacktrace.split('\n').join('\n    ');

        return stacktrace + causeStacktrace;
      }
    });

    // access first error
    Object.defineProperty(this, 'cause', {value: () => causes[0], enumerable: false, writable: false});

    // untested; access cause stack with error.causes()
    Object.defineProperty(this, 'causes', {value: () => causes, enumerable: false, writable: false});
  }

  code(code) {
    this.code = code;
  }

  toObject() {
    return this.toJSON();
  }
}

export function useSourceOnError() {
  /* eslint-disable no-extend-native */
  // TODO fix @jadesym?
  Object.defineProperty(Error.prototype, 'sourceStack', {
    enumerable: false,
    configurable: false,
    get: function lookupSource() {
      const stack = this.stack;
      return stack.replace(/\((.*\.compiled\.js):([0-9]+?):([0-9]+?)\)/g, (matched, source, line, column) => {
        try {
          const sourcemap = fs.readFileSync(`${source}.map`, 'utf8');
          const consumer = new SourceMapConsumer(sourcemap);
          const origin = consumer.originalPositionFor({line, column});
          if (!origin.line) {
            return matched;
          }

          return `(${origin.source}:${origin.line}:${origin.column})`;
        } catch (e) {
          return matched;
        }
      });
    }
  });
  /* eslint-enable no-extend-native */
}

export function stripUndefNull(obj) {
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      if (isNullOrUndefined(obj[k])) {
        delete obj[k];
      }
    }
  }

  return obj;
}
