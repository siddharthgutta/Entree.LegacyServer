module.exports = function fileTransform(grunt) {
  grunt.registerMultiTask('filetransform', 'File transform module', function transform() {
    const transformer = this.options({
      transformer: null
    }).transformer;

    if (transformer && typeof transformer.transform === 'function') {
      this.files.forEach(file => {
        const input = file.src[0];
        let output = file.dest; // grunt multi-ext fix
        if (file.orig.ext) {
          const dotidx = input.lastIndexOf('.');
          output = input.substring(0, dotidx < 0 ? input.length : dotidx) + file.orig.ext;
        }

        grunt.log.writeln(`Transforming...${input} --> ${output}`);
        transformer.transform(input, output);
      });
    }
  });
};
