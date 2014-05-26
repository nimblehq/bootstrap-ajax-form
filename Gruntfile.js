module.exports = function(grunt) {

    grunt.registerTask('watch', [ 'watch' ]);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            nimbl3: {
                src: 'n3-boostrap-ajax-form.js',
                dest: 'n3-boostrap-ajax-form.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};