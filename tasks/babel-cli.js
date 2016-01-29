#!/usr/bin/env node

var babel = require('babel-core');
var fs = require('fs');
var path = require('path');
var convert = require('convert-source-map');

exports.transform = function (input, output) {
  var source = fs.readFileSync(input, 'utf8');
  var generated = babel.transform(source, {
    filename: input,
    ignore: false,
    only: null,
    sourceMap: 'both',
    retainLines: false
  });

  var code = generated.code.replace(/require\(['"]\.(.*?)['"]\)/mg, function (matched, group) {
    return "require('." + group.replace(/\.es6$/g, '') + '.compiled.js' + "')";
  });

  var sourcemap = convert.fromSource(code);
  var sourcemapfile = output + '.map';
  var ccode = convert.removeMapFileComments(code) + "\n//# sourceMappingURL=" + path.basename(sourcemapfile);

  fs.writeFileSync(output, ccode, 'utf8');
  fs.writeFileSync(sourcemapfile, sourcemap.toJSON(), 'utf8');
};

if (process.argv.length > 3) {
  var input = process.argv[3];
  var output = process.argv[2];

  exports.transform(input, output);
}
