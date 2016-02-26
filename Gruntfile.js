/* eslint strict: 0 */

'use strict';

const babel = require('./tasks/babel-cli');

module.exports = grunt => {
  require('load-grunt-tasks')(grunt);
  require('./tasks/grunt-filetransform')(grunt);

  const config = {
    filetransform: {
      babel: {
        options: {
          transformer: babel,
          env: ''
        },
        files: [{
          expand: true,
          src: ['**/*.es6', '!**/node_modules/**'],
          ext: '.compiled.js'
        }]
      }
    },
    clean: {
      compiled: ['./**/*.compiled.js', './**/*.compiled.js.map']
    }
  };

  grunt.initConfig(config);

  grunt.registerTask('compile', [
    'clean:compiled',
    'filetransform:babel'
  ]);

  grunt.registerTask('build', [
    'clean',
    'compile'
  ]);

  grunt.registerTask('production', [
    'build'
  ]);

  grunt.registerTask('default', 'build');
};
