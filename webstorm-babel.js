#!/usr/bin/env node

var babel = require('babel-core');
var fs = require('fs');

var output = process.argv[2];
var input = process.argv[3];
var source = fs.readFileSync(input, 'utf8');
var generated = babel.transform(source, {
  filename: input,
  ignore: false,
  only: null,
  sourceMap: 'inline'
});

var code = generated.code.replace(/require\('\.(.*?)'\)/mg, function (matched, group) {
  return "return ('." + group.replace(/\.js$/, '') + "-compiled" + "')";
});

fs.writeFileSync(output, code, 'utf8');
