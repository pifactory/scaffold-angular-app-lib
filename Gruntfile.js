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
          'app-lib/**/*.js'
        ]
      }
    },

    less: {
      build: {
        options: {
          paths: ['app-lib/styles']
        },
        files: {
          '<%= libStyle %>': 'app-lib/styles/main.less'
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

    useminPrepare: {
      html: 'demo-app/index.html',
      options: {
        staging: '.tmp',
        dest: '<%= libDistPath %>',
        flow: {
          html: {
            steps: {
              js: ['concat'],
              css: ['concat']
            },
            post: (function () {

              // will be put in bower.json later
              var generatedJsFiles = [];
              grunt.config.set('generated.js.files', generatedJsFiles);

              return {
                js: [{
                  name: 'concat',
                  createConfig: function setAppLibSource(context) {
                    var appLibPrefix = new RegExp('^demo-app\\' + grunt.config.get('libWebRoot'));
                    context.options.generated.files.forEach(function (files) {
                      generatedJsFiles.push(files.dest);
                      grunt.config.set('generated.js.files', generatedJsFiles);
                      files.src = files.src.map(function (src) {
                        return src.replace(appLibPrefix, 'app-lib');
                      });
                    });
                  }
                }]
              };

            })()
          }
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      build: {
        src: '<%= libStyle %>'
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
          filter: function (src) {
            var srcpath = src.split(path.sep);
            return srcpath[1] === srcpath[3];
          },
          rename: function (dest, src) {
            return path.join('.tmp/demo-app.libs', src.split(path.sep).slice(2).join(path.sep));
          }
        }],
        timestamp: true
      }
    },

    wiredep: {
      demo: {
        src: 'demo-app/index.html',
        ignorePath: /\.\.\//,
        devDependencies: true
      }
    },

    browserSync: {
      bsFiles: {
        src: [
          'app-lib/**/*.{html,js}',
          '<%= libStyle %>',
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
            '.tmp/demo-app.libs'
          ],
          routes: {
            'configured': 'in loadBowerConfig()'
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
              connect.static('.tmp/demo-app.libs'),
              connect().use(
                grunt.config.get('libWebRoot'),
                connect.static('./app-lib')
              ),
              connect.static('dist'),
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
      libLess: {
        files: ['app-lib/styles/**/*.less'],
        tasks: ['less:build', 'autoprefixer:build'],
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
          'app-lib/**/*.{html,js}',
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

    var libWebRoot = '/' + bower.name;
    var libDistPath = path.join('dist', bower.name);
    var libStyle = libDistPath + '/main.css';

    grunt.config.set('libWebRoot', libWebRoot);
    grunt.config.set('libDistPath', libDistPath);
    grunt.config.set('libStyle', libStyle);

    var routes = {};
    routes[libWebRoot] = 'app-lib';
    routes['/'] = 'dist';
    routes['/bower_components'] = 'bower_components';
    grunt.config.set('browserSync.options.server.routes', routes);
  }

  loadBowerConfig();

  grunt.registerTask('reloadBower', 'Internal task.', function () {
    loadBowerConfig();
  });

  grunt.registerTask('updateBower', 'Internal task.', function () {
    var bower = grunt.file.readJSON('bower.json');
    var generatedJsFiles = grunt.config.get('generated.js.files');
    if (generatedJsFiles instanceof Array && generatedJsFiles.length > 0) {
      bower.main = grunt.config.get('generated.js.files').slice();
      bower.main.push(grunt.config.get('libStyle'));
      grunt.file.write('bower.json', JSON.stringify(bower, null, 2));
    } else {
      grunt.warn('No javascript files will be exported. ' +
        ' Did you forgot to place usemin <!-- build:js index.js --> <!-- endbuild -->' +
        ' annotations around your app-lib script import tags in demo-app/index.html?');
    }
  });

  grunt.registerTask('build', 'Prepare distribution files from sources in app-lib folder', function () {

    loadBowerConfig();

    grunt.task.run([
      'clean:build',
      'eslint:build',
      'less:build',
      'useminPrepare',
      'concat',
      'updateBower',
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
