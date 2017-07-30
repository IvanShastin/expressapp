module.exports = function(grunt) {
    [
        'grunt-cafe-mocha'
    ].forEach((task) => {
        grunt.loadNpmTasks(task);
    });

    grunt.initConfig({
        cafemocha: {all: {src: 'qa/tests-*.js', options: {ui: 'tdd'}}}
    });

    grunt.registerTask('default', ['cafemocha']);
};