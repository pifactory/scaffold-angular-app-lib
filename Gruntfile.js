'use strict';
/*eslint-env node*/

var path = require('path');

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    clean: {
      build: ['app-lib.gen', 'dist'],
      demo: ['demo-app.gen', 'demo-app.libs']
    },

    eslint: {
      build: {
        src: [
          'Gruntfile.js',
          'app-lib/scripts/**/*.js'
        ]
      }
    },

    less: {
      build: {
        options: {
          paths: ['app-lib/styles']
        },
        files: {
          'app-lib.gen/styles/main.css': 'app-lib/styles/main.less'
        }
      },
      demo: {
        options: {
          paths: ['demo-app/styles']
        },
        files: {
          'demo-app.gen/styles/main.css': 'demo-app/styles/main.less'
        }
      }
    },

    concat: {
      buildCss: {
        options: {
          separator: '\n'
        },
        src: ['app-lib/styles/**/*.css', 'app-lib.gen/styles/**/*.css'],
        dest: '<%= libStyle %>'
      },
      buildJs: {
        options: {
          separator: ';',
          banner: "'use strict';\n",
          process: function (src, filepath) {
            return '// Source: ' + filepath + '\n' +
              src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
          }
        },
        src: ['app-lib/scripts/lib.js', 'app-lib/scripts/**/*.js'],
        dest: '<%= libScript %>'
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      build: {
        src: '<%= libDistPath %>/main.css'
      },
      demo: {
        src: 'demo-app.gen/styles/main.css'
      }
    },

    copy: {
      build: {
        files: [{
          expand: true,
          cwd: 'app-lib',
          src: [
            '**',
            '!**/*.js',
            '!**/*.css'
          ],
          dest: '<%= libDistPath %>',
          filter: 'isFile'
        }]
      },

      demo: {
        files: [{
          expand: true,
          cwd: 'bower_components',
          src: [
            '*/dist/**/*',
            '!**/*.{js,css}'
          ],
          filter: 'isFile',
          rename: function (dest, src) {
            var sourceArray = src.split(path.sep);
            sourceArray.splice(0, 2);
            return path.join('demo-app.libs', sourceArray.join(path.sep));
          }
        }]
      }
    },

    wiredep: {
      demo: {
        src: 'demo-app/index.html',
        ignorePath: /\.\.\/(dist\/)?/,
        devDependencies: true,
        includeSelf: true
      }
    },

    browserSync: {
      bsFiles: {
        src: [
          'dist/**/*.html',
          'dist/**/*.js',
          'dist/**/*.css',
          'demo-app/**/*.html',
          'demo-app/**/*.js',
          'demo-app/**/*.css'
        ]
      },
      options: {
        port: 9000,
        watchTask: true,
        server: {
          baseDir: [
            'demo-app.gen',
            'demo-app',
            'dist',
            'demo-app.libs'
          ],
          routes: {
            '/bower_components': 'bower_components'
          }
        }
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('demo-app.gen'),
              connect.static('demo-app'),
              connect.static('dist'),
              connect.static('demo-app.libs'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              )
            ];
          }
        }
      }
    },

    watch: {
      options: {
        livereloadOnError: false
      },
      configFiles: {
        files: ['Gruntfile.js'],
        options: {
          reload: true
        }
      },
      bower: {
        files: ['bower.json'],
        tasks: ['reloadBower', 'wiredep']
      },
      libJs: {
        files: ['app-lib/scripts/**/*.js'],
        tasks: ['newer:eslint', 'concat:buildJs'],
        options: {
          livereload: true
        }
      },
      libStyle: {
        files: ['app-lib/styles/**/*.less'],
        tasks: ['less:build', 'concat:buildCss', 'autoprefixer:build'],
        options: {
          livereload: true
        }
      },
      libAssets: {
        files: [
          'app-lib/**/*.html',
          'app-lib/**/*.css'
        ],
        tasks: ['newer:copy:build'],
        options: {
          livereload: true
        }
      },
      demoStyle: {
        files: ['demo-app/styles/**/*.less'],
        tasks: ['less:demo', 'autoprefixer:demo'],
        options: {
          livereload: true
        }
      },
      livereload: {
        files: [
          'demo-app/**/*.html',
          'demo-app/**/*.js',
          'demo-app.gen/**/*.css'
        ],
        options: {
          livereload: true
        }
      }
    }
  });

  function loadBowerConfig() {
    var bower = grunt.file.readJSON('bower.json');

    var libDistPath = path.join('dist', grunt.file.readJSON('bower.json').name);
    var libScript = libDistPath + '/index.js';
    var libStyle = libDistPath + '/main.css';

    var msg = 'bower.json has to define at least 2 main files: ' + libScript + ' and ' + libStyle;
    if (!bower.main || bower.main.length < 2 || bower.main.indexOf(libScript) < 0 || bower.main.indexOf(libStyle) < 0) {
      grunt.warn(msg);
    } else {
      grunt.config.set('libDistPath', libDistPath);
      grunt.config.set('libScript', libScript);
      grunt.config.set('libStyle', libStyle);
    }
  }

  loadBowerConfig();

  grunt.registerTask('reloadBower', function () {
    loadBowerConfig();
  });

  grunt.registerTask('build', function () {

    loadBowerConfig();

    grunt.task.run([
      'clean:build',
      'eslint:build',
      'concat:buildJs',
      'less:build',
      'concat:buildCss',
      'autoprefixer:build',
      'copy:build'
    ]);

  });

  grunt.registerTask('serve', function (reloader) {
    var serveTasks = [
      'build',
      'clean:demo',
      'less:demo',
      'autoprefixer:demo',
      'copy:demo',
      'wiredep',
      'connect:livereload',
      'watch'
    ];

    if (reloader === 'browserSync') {
      serveTasks.push('browserSync');
    } else {
      serveTasks.push('connect:livereload');
    }

    serveTasks.push('watch');

    grunt.task.run(serveTasks);
  });

  grunt.registerTask('default', [
    'build'
  ]);
};
