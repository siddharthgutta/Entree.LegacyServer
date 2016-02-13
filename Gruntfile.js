/* eslint strict: 0 */

'use strict';

module.exports = grunt => {
  require('load-grunt-tasks')(grunt);
  require('./tasks/grunt-filetransform')(grunt);

  grunt.initConfig({
    clean: {
      build: ['public/', './package.noDevDeps.json'],
      compiled: ['./**/*.compiled.js', './**/*.compiled.js.map']
    },
    filetransform: {
      babel: {
        options: {
          transformer: require('./tasks/babel-cli')
        },
        files: [{
          expand: true,
          src: ['**/*.es6'],
          ext: '.compiled.js'
        }]
      }
    }
  });

  grunt.registerTask('compile', [
    'clean:compiled',
    'filetransform:babel'
  ]);
};
