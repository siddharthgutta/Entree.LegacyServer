/* eslint strict: 0 */

'use strict';

const mozjpeg = require('imagemin-mozjpeg');
const autoprefixer = require('autoprefixer');
const config = require('config');

// requesting build1

module.exports = grunt => {
  require('load-grunt-tasks')(grunt);
  require('./tasks/grunt-filetransform')(grunt);

  const gruntConfig = {
    uglify: {
      options: {
        banner: '/*! Grunt Uglify <%= grunt.template.today(\'yyyy-mm-dd\') %> */ ',
        compress: {
          drop_console: false,
          keep_fnames: true,
          keep_fargs: true
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
          transform: [['babelify', {env: 'client'}]],
          browserifyOptions: {
            debug: false, // source mapping
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
          transform: [['babelify', {env: 'client'}]],
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
          autoprefixer({browsers: ['> 1%', 'last 10 versions']})
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
          data: {config: JSON.stringify(config.get('Client'))},
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
          {expand: true, cwd: 'resources/root', src: ['**/*'], dest: 'public/'},
          {expand: true, cwd: 'resources/fonts', src: ['**/*'], dest: 'public/fonts'},
          {expand: true, cwd: 'resources/images', src: ['**/*'], dest: 'public/images'},
          {expand: true, cwd: 'resources/audio', src: ['**/*'], dest: 'public/audio'},
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
          'cordova/build/Entree.apk': 'cordova/platforms/android/build/outputs/apk/android-debug.apk',
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
      cordova: ['cordova/plugins', 'cordova/www', 'cordova/platforms'],
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
          transformer: require('./tasks/babel-cli'),
          extSrc: '.es6',
          extDest: '.compiled.js',
          env: 'server'
        },
        files: [{
          expand: true,
          src: ['**/*.es6', '!**/node_modules/**'],
          ext: '.compiled.js'
        }]
      }
    },
    shell: {
      'cordova-prepare': {
        command: ['cd cordova',
          'mkdir -p www',
          'mkdir -p platforms',
          'cordova platform add ios || true',
          'cordova platform add android || true',
          'cordova prepare',
          'cordova prepare ios',
          'cordova prepare android',
          `echo "${['@implementation NSURLRequest(DataController)',
            '+ (BOOL)allowsAnyHTTPSCertificateForHost:(NSString *)host{return YES;}',
            '@end'].join('\n')}" >> platforms/ios/Entree/Classes/AppDelegate.m`].join(' && '),
        options: {
          execOptions: {
            maxBuffer: Number.MAX_SAFE_INTEGER
          }
        }
      },
      'cordova-build': {
        command: ['cd cordova', 'cordova build ios --device', 'cordova build android'].join(' && '),
        options: {
          execOptions: {
            maxBuffer: Number.MAX_SAFE_INTEGER
          }
        }
      }
    },
    concurrent: {
      clean: ['clean:build', 'clean:compiled'],
      build: ['imagemin', 'browserify:dist', 'filetransform:babel', 'sass:dist', 'jade:dist'],
      'build-production': ['imagemin', ['browserify:dist', 'uglify:dist'], 'compile', 'sass:dist', 'jade:dist']
    }
  };

  grunt.initConfig(gruntConfig);

  grunt.registerTask('compile', [
    'clean:compiled',
    'filetransform:babel'
  ]);

  grunt.registerTask('styles', [
    'sass:dist',
    'postcss:dist'
  ]);

  grunt.registerTask('build', [
    'concurrent:clean',
    'copy:dist',
    'concurrent:build'
  ]);

  grunt.registerTask('production', [
    'copy:dist',
    'concurrent:build-production'
  ]);

  grunt.registerTask('cordova', [
    'clean:cordova',
    'copy:cordova',
    'rename:dist',
    'shell:cordova-prepare',
    'shell:cordova-build',
    'copy:builds'
  ]);

  grunt.registerTask('cordova-prepare', [
    'clean:cordova',
    'copy:cordova',
    'rename:dist',
    'shell:cordova-prepare'
  ]);

  grunt.registerTask('default', 'build');

  grunt.registerTask('watch-scripts', [
    'browserify:dev'
  ]);

  grunt.registerTask('watch-styles', [
    'sass:dev',
    'watch:sass'
  ]);
};
