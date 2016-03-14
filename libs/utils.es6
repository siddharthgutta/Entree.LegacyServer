import chalk from 'chalk';
import {SourceMapConsumer} from 'source-map';
import fs from 'fs';
import path from 'path';
import BaseTraceError from 'trace-error';

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

export class TraceError extends BaseTraceError {
  toJSON() {
    const stack = this.stack;
    return {TraceError: stack.substring(stack.indexOf(':') + 2)};
  }
}

export function useSourceOnError() {
  /* eslint-disable no-extend-native */
  BaseTraceError.globalStackProperty = 'sourceStack';

  Object.defineProperty(Error.prototype, 'sourceStack', {
    configurable: true,
    get: function lookupSource() {
      return this.stack.replace(/\((.*\.compiled\.js):([0-9]+?):([0-9]+?)\)/g, (matched, source, line, column) => {
        try {
          const sourcemap = fs.readFileSync(`${source}.map`, 'utf8');
          const consumer = new SourceMapConsumer(sourcemap);
          const origin = consumer.originalPositionFor({line: Number(line), column: Number(column)});
          if (!origin.line) {
            return matched;
          }

          return `(${path.dirname(matched)}/${origin.source}:${origin.line}:${origin.column})`;
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
