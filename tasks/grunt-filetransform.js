/* eslint strict: 0 */

'use strict';

module.exports = function fileTransform(grunt) {
  grunt.registerMultiTask('filetransform', 'File transform module', function transform() {
    const options = this.options({transformer: null});
    const transformer = options.transformer;

    if (transformer && typeof transformer.transform === 'function') {
      this.files.forEach(file => {
        const input = file.src[0];
        const output = file.dest;
        const data = transformer.transform(input, output, options);

        for (const f in data) {
          if (data.hasOwnProperty(f)) {
            grunt.file.write(f, data[f]);
          }
        }
      });
    }
  });
};
