#!/usr/bin/env node

const babel = require('babel-core');
const fs = require('fs');
const path = require('path');
const convert = require('convert-source-map');

exports.transform = function transform(input, output) {
  const source = fs.readFileSync(input, 'utf8');
  const generated = babel.transform(source, {
    filename: input,
    ignore: false,
    only: null,
    sourceMap: 'both',
    retainLines: false
  });

  const code = generated.code.replace(/require\(['"]\.(.*?)['"]\)/mg,
      (matched, group) => `require('.${group.replace(/\.es6$/g, '')}.compiled.js\')`);

  const sourcemap = convert.fromSource(code);
  const sourcemapfile = `${output}.map`;
  const mappingUrl = path.basename(sourcemapfile);
  const ccode = `${convert.removeMapFileComments(code)}\n//# sourceMappingURL=${mappingUrl}`;

  fs.writeFileSync(output, ccode, 'utf8');
  fs.writeFileSync(sourcemapfile, sourcemap.toJSON(), 'utf8');
};

if (process.argv.length > 3) {
  const input = process.argv[3];
  const output = process.argv[2];

  exports.transform(input, output);
}
