module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['client/js/**/*.js', 'server/**/*.js', 'test/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                latedef: true,
                noarg: true,
                trailing: true,
                ignores: ['public/**/*.js']
            },
            client: {
                options: {
                    browser: true,
                    globals: {
                        jQuery: true
                    }
                },
                files: {
                    src: ['client/js/**/*.js']
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
                        'server/**/*.js',
                        'test/*.js'
                    ]
                }
            }
        },
        browserify: {
            build: {
                dest: 'public/js/site.js',
                src: ['client/js/index.js'],
                options: {
                    alias: ['client/js/index.js:s7n']
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
                    'client/vendor/css/**/*.css',
                    '/tmp/styles.css'
                ],
                dest: 'public/css/site.css'
            },
            vendor: {
                src: [
                    'bower_components/underscore/underscore.js',
                    'bower_components/foundation/js/vendor/jquery.js',
                    'bower_components/foundation/js/foundation.js',
                    'bower_components/moment/moment.js',
                    'bower_components/moment/min/langs.js',
                    'bower_components/marked/lib/marked.js',
                    'bower_components/ractive/ractive.js',
                    'bower_components/ractive-events-tap/ractive-events-tap.js',
                    'bower_components/ractive-decorators-sortable/Ractive-decorators-sortable.js',
                    'bower_components/ractive-transitions-fade/ractive-transitions-fade.js',
                    'bower_components/ractive-transitions-slide/ractive-transitions-slide.js',
                    'client/vendor/js/*.js'
                ],
                dest: 'public/js/vendor.js'
            }
        },
        copy: {
            js: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_components/foundation/js/vendor/modernizr.js'],
                dest: 'public/js/'
            },
            font: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: [
                    'bower_components/font-awesome/fonts/*',
                    'client/fonts/*'
                ],
                dest: 'public/fonts/'
            },
            img: {
                expand: true,
                cwd: 'client/img',
                src: ['**'],
                dest: 'public/img'
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: true
            },
            vendor: {
                files: {
                    'public/js/vendor.js': ['public/js/vendor.js']
                }
            },
            client: {
                files: {
                    'public/js/site.js': ['public/js/site.js']
                }
            }
        },
        watch: {
            clientjs: {
                files: ['client/js/**/*.js'],
                tasks: ['jshint:client', 'browserify']
            },
            server: {
                files: ['Gruntfile.js', 'cluster.js', 'server/**/*.js', 'test/**/*.js'],
                tasks: ['jshint:server']
            },
            scss: {
                files: ['client/scss/**/*.scss'],
                tasks: ['sass', 'concat:css']
            }
        },
        abideExtract: {
            js: {
                src: 'server/**/*.js',
                dest: 'server/locale/templates/LC_MESSAGES/messages.pot'
            },
            jade: {
                src: 'server/views/**/*.jade',
                dest: 'server/locale/templates/LC_MESSAGES/messages.pot',
                options: {
                    language: 'jade',
                    keyword: '__'
                }
            }
        },
        abideMerge: {
            messages: {
                options: {
                    template: 'server/locale/templates/LC_MESSAGES/messages.pot',
                    localeDir: 'server/locale'
                }
            }
        },
        abideCompile: {
            json: {
                dest: 'public/js/',
                options: {
                    type: 'json',
                    localeDir: 'server/locale'
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

    grunt.registerTask('default', ['jshint', 'sass', 'concat', 'copy', 'browserify', 'abideCompile']);
    grunt.registerTask('prod', ['default', 'uglify']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('locales', ['abideExtract', 'abideMerge']);
};
