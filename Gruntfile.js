module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['client/js/**/*.js', 'server/**/*.js', 'bot/**/*.js', 'test/*.js'],
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
            dest: {
                files: {
                    'tmp/css/styles.css': 'client/css/styles.scss'
                }
            }
        },
        concat: {
            css: {
                src: ['client/vendor/css/**/*.css', 'tmp/css/styles.css'],
                dest: 'server/public/css/site.css'
            },
            vendor: {
                src: [
                    'client/vendor/js/jquery.js',
                    'client/vendor/js/underscore.js',
                    'client/vendor/js/custom.modernizr.js',
                    'client/vendor/js/foundation.js',
                    'client/vendor/js/select2.js',
                    'client/vendor/js/*.js'
                ],
                dest: 'server/public/js/vendor.js'
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: true,
                report: 'gzip'
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['jshint', 'sass', 'concat', 'browserify']);
    grunt.registerTask('prod', ['jshint', 'sass', 'concat', 'browserify', 'uglify']);
}
