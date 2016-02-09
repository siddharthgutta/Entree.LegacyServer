/* eslint strict: 0 */

'use strict';

module.exports = grunt => {
  require('load-grunt-tasks')(grunt);
  require('./tasks/grunt-filetransform')(grunt);

  grunt.initConfig({
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
    },
    clean: {
      build: ['public/', './package.noDevDeps.json'],
      compiled: ['./**/*.compiled.js', './**/*.compiled.js.map']
    }
  });

  grunt.registerTask('compile', [
    'clean:compiled',
    'filetransform:babel'
  ]);

  grunt.registerTask('grunt-license', 'Build a list of dependencies', function transform() {
    const done = this.async();
    const pkg = require('./package.json');
    const fs = require('fs');
    const exec = require('child_process').exec;

    delete pkg.devDependencies;

    fs.writeFileSync('package.noDevDeps.json', JSON.stringify(pkg), 'utf8');

    exec('node node_modules/license-report/index.js ' +
        '--package=./package.noDevDeps.json --output=json',
        (err, stdout, stderr) => {
          if (err || stderr) console.error(err, stderr);
          else fs.writeFileSync('deps.json', JSON.stringify(JSON.parse(stdout), null, 2), 'utf8');
          fs.unlinkSync('package.noDevDeps.json');
          done();
        });
  });


  grunt.registerTask('build', [
    'clean',
    'compile',
    'grunt-license'
  ]);

  grunt.registerTask('production', [
    'build'
  ]);

  grunt.registerTask('default', 'build');
};
