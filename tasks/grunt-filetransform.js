var fs = require('fs');
module.exports = function (grunt) {
  grunt.registerMultiTask('filetransform', 'Convert es6 to es5', function () {
    var transformer = this.options({
      transformer: null
    }).transformer;

    if (transformer && typeof transformer.transform === 'function') {
      this.files.forEach(function (file) {
        var input = file.src[0];
        var gen = transformer.transform(input);
        grunt.log.writeln('Transforming...' + input);
        grunt.file.write(file.dest, gen.code);
        grunt.file.write(file.dest + '.map', gen.sourcemap.toJSON());
        grunt.log.writeln('Outputing...' + file.dest);
        grunt.log.writeln('Outputing...' + file.dest + '.map');
      });
    }
  });
};