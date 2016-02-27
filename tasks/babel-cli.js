#!/usr/bin/env node

const babel = require('babel-core');
const fs = require('fs');
const path = require('path');
const convert = require('convert-source-map');

const defaultEnv = 'server';

exports.transform = function transform(input, output, options) {
  options = options || {};
  process.env.BABEL_ENV = options.env || defaultEnv;

  const extSrc = options.extSrc || '.es6';
  const extDest = options.extDest || '.compiled.js';
  const source = fs.readFileSync(input, 'utf8');
  const generated = babel.transform(source, {
    filename: input,
    ignore: false,
    only: null,
    sourceMap: 'both',
    retainLines: false
  });

  const code = generated.code
                        .replace(/require\(['"]\.(.*?)['"]\)/mg,
                                 (matched, group) =>
                                   `require('.${group.replace(new RegExp(`${extSrc}$`, 'g'), extDest)}')`);

  const sourcemapfile = `${output}.map`;
  const mappingUrl = path.basename(sourcemapfile);
  const sourcemapfiledir = sourcemapfile.split(path.sep);
  sourcemapfiledir.pop();
  const sources = [path.relative(sourcemapfiledir.join(path.sep), input)];

  const ccode = `${convert.removeMapFileComments(code)}\n//# sourceMappingURL=${mappingUrl}`;
  const sourcemap = convert.fromSource(code)
                           .setProperty('sources', sources)
                           .toJSON();

  return {[output]: ccode, [sourcemapfile]: sourcemap};
};

if (process.argv.length > 3 && require.main === module) {
  const input = process.argv[3];
  const output = process.argv[2];
  const data = exports.transform(input, output, {});

  for (const f in data) {
    if (data.hasOwnProperty(f)) {
      fs.writeFileSync(f, data[f], 'utf8');
    }
  }
}
