#!/usr/bin/env node

const babel = require('babel-core');
const fs = require('fs');
const path = require('path');
const convert = require('convert-source-map');

const defaultEnv = 'dist';

exports.transform = function transform(input, output, options) {
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

  const sourcemap = convert.fromSource(code);
  const sourcemapfile = `${output}.map`;
  const mappingUrl = path.basename(sourcemapfile);
  const ccode = `${convert.removeMapFileComments(code)}\n//# sourceMappingURL=${mappingUrl}`;

  return {[output]: ccode, [sourcemapfile]: sourcemap.toJSON()};
};

if (process.argv.length > 4 && require.main === module) {
  const env = process.argv[4];
  const input = process.argv[3];
  const output = process.argv[2];
  const data = exports.transform(input, output, {env});

  for (const f in data) {
    if (data.hasOwnProperty(f)) {
      fs.writeFileSync(f, data[f], 'utf8');
    }
  }
}
