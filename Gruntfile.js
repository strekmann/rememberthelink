module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['client/js/**/*.js', 'server/**/*.js', 'test/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                ignores: ['public/**/*.js'],
                globals: {
                    jQuery: true
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
                    'tmp/css/styles.css': 'client/scss/styles.scss'
                }
            }
        },
        coffee: {
            compile: {
                options: {
                    bare: true
                },
                files: {
                    'tmp/js/chosen.js': [
                        'bower_components/chosen/coffee/lib/abstract-chosen.coffee',
                        'bower_components/chosen/coffee/lib/select-parser.coffee',
                        'bower_components/chosen/coffee/chosen.jquery.coffee'
                    ]
                }
            }
        },
        concat: {
            css: {
                src: [
                    'client/vendor/css/**/*.css',
                    'bower_components/dropzone/downloads/css/dropzone.css',
                    'tmp/css/styles.css'
                ],
                dest: 'public/css/site.css'
            },
            vendor: {
                src: [
                    'bower_components/underscore/underscore.js',
                    'bower_components/jquery/dist/jquery.js',
                    //'bower_components/fastclick/lib/fastclick.js',
                    'bower_components/foundation/js/foundation.js',
                    'bower_components/moment/moment.js',
                    'bower_components/moment/min/langs.js',
                    'bower_components/marked/lib/marked.js',
                    'bower_components/ractive/Ractive.js',
                    'bower_components/ractive-events-tap/Ractive-events-tap.js',
                    'bower_components/ractive-decorators-sortable/Ractive-decorators-sortable.js',
                    'bower_components/Ractive-transitions-fade/Ractive-transitions-fade.js',
                    'bower_components/Ractive-transitions-slide/Ractive-transitions-slide.js',
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
                src: ['bower_components/modernizr/modernizr.js'],
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
                dest: 'public/font/'
            },
            img: {
                expand: true,
                cwd: 'client/img',
                src: ['**'],
                dest: 'public/img/'
            },
            dropzone: {
                expand: true,
                flatten: true,
                cwd: 'bower_components',
                src: ['dropzone/**/*.png'],
                dest: 'public/img/'
            },
            chosen: {
                expand: true,
                flatten: true,
                src: ['bower_components/chosen/public/*.png'],
                dest: 'public/img/'
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
                tasks: ['jshint', 'browserify']
            },
            scss: {
                files: ['client/scss/**/*.scss'],
                tasks: ['sass', 'concat:css']
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'cluster.js',
                    watchedExtensions: ['js', 'html']
                }
            }
        },
        concurrent: {
            dev: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
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

    //grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-i18n-abide');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerTask('default', ['jshint', 'sass', 'coffee', 'concat', 'copy', 'browserify', 'abideCompile']);
    grunt.registerTask('prod', ['default', 'uglify']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('locales', ['abideExtract', 'abideMerge']);
};
