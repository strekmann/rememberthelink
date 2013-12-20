module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['client/js/**/*.js', 'server/**/*.js', 'test/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                ignores: ['server/public/**/*.js'],
                globals: {
                    jQuery: true
                }
            }
        },
        browserify: {
            build: {
                dest: 'server/public/js/site.js',
                src: ['client/js/index.js'],
                options: {
                    alias: ['client/js/index.js:s7n'],
                    transform: ['./client/lib/underscorify']
                }
            }
        },
        sass: {
            options: {
                includePaths: [
                    'bower_modules/foundation/scss',
                    'bower_modules/font-awesome/scss'
                ]
            },
            dest: {
                options: {
                    outputStyle: 'compressed'
                },
                files: {
                    'tmp/css/styles.css': 'client/css/styles.scss'
                }
            }
        },
        concat: {
            css: {
                src: [
                    'bower_modules/select2/select2.css',
                    'client/vendor/css/**/*.css', 
                    'tmp/css/styles.css'
                ],
                dest: 'server/public/css/site.css'
            },
            vendor: {
                src: [
                    'bower_modules/underscore/underscore.js',
                    'bower_modules/jquery/jquery.js',
                    'bower_modules/foundation/js/foundation.js',
                    'bower_modules/moment/moment.js',
                    'bower_modules/select2/select2.js',
                    'client/vendor/js/*.js'
                ],
                dest: 'server/public/js/vendor.js'
            }
        },
        copy: {
            js: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_modules/foundation/js/vendor/custom.modernizr.js'],
                dest: 'server/public/js/'
            },
            font: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_modules/font-awesome/fonts/*'],
                dest: 'server/public/fonts/'
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: true
            },
            vendor: {
                files: {
                    'server/public/js/vendor.js': ['server/public/js/vendor.js']
                }
            },
            client: {
                files: {
                    'server/public/js/site.js': ['server/public/js/site.js']
                }
            }
        },
        watch: {
            clientjs: {
                files: ['client/js/**/*.js'],
                tasks: ['jshint', 'browserify']
            },
            scss: {
                files: ['client/css/**/*.scss'],
                tasks: ['sass', 'concat:css']
            }
        },
        i18n: {
            js: {
                src: ['server/**/*.js']
            },
            hbs: {
                src: ['server/**/*.hbs']
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
        }
    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('default', ['jshint', 'sass', 'concat', 'copy', 'browserify']);
    grunt.registerTask('prod', ['default', 'uglify']);
    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('locales', ['i18n']);
}
