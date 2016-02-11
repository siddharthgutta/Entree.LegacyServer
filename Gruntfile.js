/* eslint strict: 0 */

'use strict';

const mozjpeg = require('imagemin-mozjpeg');

module.exports = grunt => {
  require('load-grunt-tasks')(grunt);
  require('./tasks/grunt-filetransform')(grunt);

  grunt.initConfig({
    uglify: {
      options: {
        banner: '/*! Grunt Uglify <%= grunt.template.today(\'yyyy-mm-dd\') %> */ ',
        compress: {
          drop_console: true
        }
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'public/scripts',
          src: ['**/*.js'],
          dest: 'public/scripts',
          ext: '.min.js'
        }]
      }
    },
    sass: {
      dev: {
        options: {
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: 'resources/styles',
          src: ['*.scss'],
          dest: 'public/styles',
          ext: '.min.css'
        }]
      },
      dist: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: [{
          expand: true,
          cwd: 'resources/styles',
          src: ['*.scss'],
          dest: 'public/styles',
          ext: '.min.css'
        }]
      }
    },
    browserify: {
      dist: {
        options: {
          transform: ['babelify', 'config-browserify'],
          browserifyOptions: {
            debug: true, // source mapping
            ignoreMTime: true
          }
        },
        files: [{
          expand: true,
          cwd: 'asr/',
          src: ['**/Bootstrap.js', 'Bootstrap.js', '**/Bootstrap.js', 'Bootstrap.js'],
          dest: 'public/scripts',
          ext: '.min.js'
        }]
      },
      dev: {
        options: {
          watch: true,
          keepAlive: true,
          transform: ['babelify', 'config-browserify'],
          browserifyOptions: {
            debug: true, // source mapping
            ignoreMTime: true
          }
        },
        files: [{
          expand: true,
          cwd: 'asr/',
          src: ['**/Bootstrap.js', 'Bootstrap.js', '**/Bootstrap.js', 'Bootstrap.js'],
          dest: 'public/scripts',
          ext: '.min.js' // NOTE mimic uglifyjs has been run
        }]
      }
    },
    postcss: {
      options: {
        map: false,
        processors: [
          require('autoprefixer')({
            browsers: ['> 1%', 'last 10 versions']
          })
        ]
      },
      dist: {
        src: 'public/styles/*.css'
      }
    },
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 4,
          svgoPlugins: [{removeViewBox: false}],
          use: [mozjpeg()]
        },
        files: [{
          expand: true,
          cwd: 'resources/images',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'public/images'
        }]
      }
    },
    jade: {
      dist: {
        options: {
          optimizationLevel: 3
        },
        files: [{
          expand: true,
          cwd: 'views/',
          src: ['**/*.jade'],
          dest: 'public/',
          ext: '.html'
        }]
      }
    },
    copy: {
      dist: {
        files: [
          {expand: true, cwd: 'resources/fonts', src: ['**/*'], dest: 'public/fonts'},
          {expand: true, cwd: 'resources/images', src: ['**/*'], dest: 'public/images'},
          {expand: true, cwd: 'resources/videos', src: ['**/*'], dest: 'public/videos'},
          {expand: true, cwd: 'resources/scripts', src: ['**/*'], dest: 'public/scripts'}
        ]
      },
      cordova: {
        files: [
          {expand: true, cwd: 'public/', src: ['**/*'], dest: 'cordova/www'}
        ]
      },
      builds: {
        files: {
          'cordova/build/android-debug.apk': 'cordova/platforms/android/build/outputs/apk/android-debug.apk',
          'cordova/build/Entree.ipa': 'cordova/platforms/ios/build/device/Entree.ipa'
        }
      }
    },
    watch: {
      sass: {
        files: ['resources/styles/*.scss', 'resources/styles/**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          spawn: false
        }
      }
    },
    clean: {
      build: ['public/', './package.noDevDeps.json'],
      compiled: ['./**/*.compiled.js', './**/*.compiled.js.map']
    },
    rename: {
      dist: {
        files: [
          {src: ['cordova/www/cordova.html'], dest: 'cordova/www/index.html'}
        ]
      }
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
    },
    shell: {
      'cordova-build': {
        command: 'npm run cordova-build'
      }
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

  grunt.registerTask('styles', [
    'sass:dist',
    'postcss:dist'
  ]);

  grunt.registerTask('build', [
    'clean:build',
    'clean:compiled',
    'filetransform:babel',
    'grunt-license',
    'copy:dist',
    'sass:dist',
    'postcss:dist',
    'browserify:dist',
    'jade:dist',
    'cordova'
  ]);

  grunt.registerTask('production', [
    'clean:build',
    'clean:compiled',
    'filetransform:babel',
    'copy:dist',
    'grunt-license',
    'sass:dist',
    'imagemin',
    'postcss:dist',
    'browserify:dist',
    'uglify:dist',
    'jade:dist',
    'cordova'
  ]);

  grunt.registerTask('cordova', [
    'copy:cordova',
    'rename:dist',
    'shell:cordova-build',
    'copy:builds'
  ]);

  grunt.registerTask('default', 'build');

  grunt.registerTask('auto-build-scripts', [
    'browserify:dev'
  ]);

  grunt.registerTask('auto-build-styles', [
    'sass:dev',
    'watch:sass'
  ]);
};
