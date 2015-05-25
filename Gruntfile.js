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
      build: ['.tmp/app-lib.gen', 'dist'],
      demo: ['.tmp/demo-app.gen', '.tmp/demo-app.libs']
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
          '.tmp/app-lib.gen/styles/main.css': 'app-lib/styles/main.less'
        }
      },
      demo: {
        options: {
          paths: ['demo-app/styles']
        },
        files: {
          '.tmp/demo-app.gen/styles/main.css': 'demo-app/styles/main.less'
        }
      }
    },

    concat: {
      buildCss: {
        options: {
          separator: '\n'
        },
        src: ['app-lib/styles/**/*.css', '.tmp/app-lib.gen/styles/**/*.css'],
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
        src: '.tmp/demo-app.gen/styles/main.css'
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app-lib/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= libDistPath %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app-lib/images',
          src: '**/*.svg',
          dest: '<%= libDistPath %>/images'
        }]
      }
    },

    copy: {
      build: {
        files: [{
          expand: true,
          cwd: 'app-lib',
          src: [
            '**',
            '!**/*.{js,css,png,jpg,jpeg,gif,svg}'
          ],
          dest: '<%= libDistPath %>',
          filter: 'isFile'
        }],
        timestamp: true
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
            return path.join('.tmp/demo-app.libs', sourceArray.join(path.sep));
          }
        }],
        timestamp: true
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
          'dist/**/*.{html,js,css}',
          'demo-app/**/*.{html,js,css}'
        ]
      },
      options: {
        port: 9000,
        watchTask: true,
        server: {
          baseDir: [
            '.tmp/demo-app.gen',
            'demo-app',
            'dist',
            '.tmp/demo-app.libs'
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
              connect.static('.tmp/demo-app.gen'),
              connect.static('demo-app'),
              connect.static('dist'),
              connect.static('.tmp/demo-app.libs'),
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
      libLess: {
        files: ['app-lib/styles/**/*.less'],
        tasks: ['less:build', 'concat:buildCss', 'autoprefixer:build'],
        options: {
          livereload: true
        }
      },
      libCss: {
        files: ['app-lib/styles/**/*.css'],
        tasks: ['concat:buildCss', 'autoprefixer:build'],
        options: {
          livereload: true
        }
      },
      libAssets: {
        files: [
          'app-lib/**/*.html'
        ],
        tasks: ['newer:copy:build'],
        options: {
          livereload: true
        }
      },
      demoLess: {
        files: ['demo-app/styles/**/*.less'],
        tasks: ['less:demo', 'autoprefixer:demo'],
        options: {
          livereload: true
        }
      },
      livereload: {
        files: [
          'demo-app/**/*.{html,js,css}'
        ],
        options: {
          livereload: true
        }
      }
    },

    pkg: grunt.file.readJSON('package.json'),

    /*eslint camelcase: [2, {properties: "never"}]*/
    yabs: {
      prerelease: {
        check_git: { branch: ['master'], canPush: true, clean: true },

        bump_versionOnly: { updateConfig: 'pkg', noWrite: true },

        check_version: { branch: ['master'], cmpVersion: 'gt' }
      },

      release: {
        bump_updateManifests: { manifests: ['package.json', 'bower.json'], updateConfig: false },

        commit: { add: ['.'], addKnown: true },

        tag: { name: '{%= version %}' },

        push: { tags: true, useFollowTags: true }
      }
    }
  });

  function loadBowerConfig() {
    var pkgName = grunt.config.get('pkg.name');
    var bower = grunt.file.readJSON('bower.json');

    if (pkgName !== bower.name) {
      grunt.warn('Package names in package.json and bower.json do not match');
    }

    var libDistPath = path.join('dist', grunt.file.readJSON('bower.json').name);
    var libScript = libDistPath + '/index.js';
    var libStyle = libDistPath + '/main.css';

    if (!bower.main || bower.main.length < 1 || bower.main.indexOf(libScript) < 0) {
      grunt.warn('bower.json does not declare ' + libScript + ' as main file');
    }

    if (!bower.main) {
      var hasMainFilesOutsideDist = false;
      bower.main.forEach(function (mainFile) {
        hasMainFilesOutsideDist = hasMainFilesOutsideDist || path.normalize(mainFile).indexOf('dist/') !== 0;
      });

      if (hasMainFilesOutsideDist) {
        grunt.warn('bower.json declares main files outside the dist folder');
      }
    }

    grunt.config.set('libDistPath', libDistPath);
    grunt.config.set('libScript', libScript);
    grunt.config.set('libStyle', libStyle);
  }

  loadBowerConfig();

  grunt.registerTask('reloadBower', 'Internal task.', function () {
    loadBowerConfig();
  });

  grunt.registerTask('build', 'Prepare distribution files from sources in app-lib folder', function () {

    loadBowerConfig();

    grunt.task.run([
      'clean:build',
      'eslint:build',
      'concat:buildJs',
      'less:build',
      'concat:buildCss',
      'autoprefixer:build',
      'imagemin',
      'svgmin',
      'copy:build'
    ]);

  });

  grunt.registerTask('serve', 'Start demo-app with livereload. Use serve:browserSync to run it with browserSync.', function (reloader) {
    var serveTasks = [
      'build',
      'clean:demo',
      'less:demo',
      'autoprefixer:demo',
      'copy:demo',
      'wiredep'
    ];

    if (reloader === 'browserSync') {
      serveTasks.push('browserSync');
    } else {
      serveTasks.push('connect:livereload');
    }

    serveTasks.push('watch');

    grunt.task.run(serveTasks);
  });

  grunt.registerTask('release', 'Makes next release. Use release:minor or release:major if needed.' +
    ' See semver for all supported increment modes.', function (pIncrement) {
    var increment = pIncrement || 'patch';
    grunt.task.run([
      'yabs:prerelease:' + increment,
      'build',
      'yabs:release:' + increment
    ]);
  });

  grunt.registerTask('default', [
    'build'
  ]);
};
