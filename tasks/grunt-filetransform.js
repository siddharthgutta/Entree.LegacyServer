var fs = require('fs');
module.exports = function (grunt) {
  grunt.registerMultiTask('filetransform', 'File transform module', function () {
    var transformer = this.options({
      transformer: null
    }).transformer;

    if (transformer && typeof transformer.transform === 'function') {
      this.files.forEach(function (file) {
        var input = file.src[0];
        var output = file.dest; // grunt multi-ext fix
        if (file.orig.ext) {
          var dotidx = input.lastIndexOf('.');
          output = input.substring(0, dotidx < 0 ? input.length : dotidx) + file.orig.ext;
        }

        grunt.log.writeln('Transforming...' + input + " --> " + output);
        transformer.transform(input, output);
      });
    }
  });
};