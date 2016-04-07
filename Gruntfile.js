module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['src/client/js/**/*.js', 'src/server/**/*.js', 'test/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                latedef: true,
                noarg: true,
                trailing: true,
                ignores: ['dist/**/*.js']
            },
            client: {
                options: {
                    browser: true,
                    globals: {
                        jQuery: true
                    }
                },
                files: {
                    src: ['src/client/js/**/*.js']
                }
            },
            server: {
                options: {
                    node: true
                },
                files: {
                src: [
                        'Gruntfile.js',
                        'cluster.js',
                        'src/server/**/*.js',
                        'test/*.js'
                    ]
                }
            }
        },
        browserify: {
            build: {
                dest: 'dist/public/js/site.js',
                src: ['src/client/js/index.js'],
                options: {
                    alias: ['./src/client/js/index.js:s7n']
                }
            }
        },
        sass: {
            options: {
                includePaths: [
                    'bower_components/foundation/scss',
                    'bower_components/font-awesome/scss'
                ]
            },
            dest: {
                options: {
                    outputStyle: 'compressed'
                },
                files: {
                    '/tmp/styles.css': 'client/scss/styles.scss'
                }
            }
        },
        concat: {
            css: {
                src: [
                    'src/client/vendor/css/**/*.css',
                    'bower_components/select2/select2.css',
                    '/tmp/styles.css'
                ],
                dest: 'dist/public/css/site.css'
            },
            vendor: {
                options: {
                    separator: ';' + grunt.util.linefeed
                },
                src: [
                    'bower_components/underscore/underscore.js',
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/foundation/js/foundation.js',
                    'bower_components/moment/moment.js',
                    'bower_components/moment/locale/nb.js',
                    'bower_components/marked/lib/marked.js',
                    'bower_components/ractive/ractive.js',
                    'bower_components/ractive-events-tap/ractive-events-tap.js',
                    'bower_components/ractive-decorators-sortable/Ractive-decorators-sortable.js',
                    'bower_components/ractive-transitions-fade/ractive-transitions-fade.js',
                    'bower_components/ractive-transitions-slide/ractive-transitions-slide.js',
                    'bower_components/select2/select2.js',
                    'src/client/vendor/js/*.js'
                ],
                dest: 'dist/public/js/vendor.js'
            }
        },
        copy: {
            js: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_components/modernizr/modernizr.js'],
                dest: 'dist/public/js/'
            },
            font: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: [
                    'bower_components/font-awesome/fonts/*',
                    'src/client/fonts/*'
                ],
                dest: 'dist/public/fonts/'
            },
            img: {
                expand: true,
                cwd: 'src/client/img',
                src: ['**'],
                dest: 'dist/public/img/'
            },
            select2: {
                expand: true,
                flatten: true,
                src: ['bower_components/select2/*.png', 'bower_components/select2/*.gif'],
                dest: 'dist/public/css/'
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: true
            },
            vendor: {
                files: {
                    'dist/public/js/vendor.js': ['public/js/vendor.js']
                }
            },
            client: {
                files: {
                    'dist/public/js/site.js': ['dist/public/js/site.js']
                }
            }
        },
        watch: {
            clientjs: {
                files: ['src/client/js/**/*.js'],
                tasks: ['jshint:client', 'browserify']
            },
            server: {
                files: ['Gruntfile.js', 'cluster.js', 'src/server/**/*.js', 'test/**/*.js'],
                tasks: ['jshint:server']
            },
            scss: {
                files: ['src/client/scss/**/*.scss'],
                tasks: ['sass', 'concat:css']
            }
        },
        abideExtract: {
            js: {
                src: 'src/server/**/*.js',
                dest: 'src/server/locale/templates/LC_MESSAGES/messages.pot'
            },
            jade: {
                src: 'src/server/views/**/*.jade',
                dest: 'src/server/locale/templates/LC_MESSAGES/messages.pot',
                options: {
                    language: 'jade',
                    keyword: '__'
                }
            }
        },
        abideMerge: {
            messages: {
                options: {
                    template: 'src/server/locale/templates/LC_MESSAGES/messages.pot',
                    localeDir: 'src/server/locale'
                }
            }
        },
        abideCompile: {
            json: {
                dest: 'dist/public/js/',
                options: {
                    type: 'json',
                    localeDir: 'src/server/locale'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-i18n-abide');

    grunt.registerTask('default', ['copy', 'browserify', 'abideCompile']);
    grunt.registerTask('prod', ['default', 'uglify']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('locales', ['abideExtract', 'abideMerge']);
};
