'use strict';
 
module.exports = function(grunt) {
   
   var globalConfig = {};
   
   grunt.initConfig({
      globalConfig : globalConfig,
      pkg : grunt.file.readJSON('package.json'),
      watch: {
        files: 'src/*.js',
        tasks: ['rollup']
      },
      rollup: {
         options: {
            format: 'amd',
         },
         playerViewController: {
            'dest':'dist/player-view-controller.js',
            'src' : 'src/player-view-controller.js', 
         },
         player: {
            'dest':'dist/player.js',
            'src' : 'src/player.js', 
         },
      },
   });

   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-rollup');

   grunt.registerTask('default', ['watch', 'rollup: player', 'rollup: playerViewController']);
};

//------------------------------------------------
// grunt rollup
// grunt --config
// rollup src/player.js --output dist/player.js --format amd