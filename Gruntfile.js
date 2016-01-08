module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['client/**/*.js', 'server/**/*.js', '*.js'],
        dest: 'dist/concat.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
        options: {
      banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
    },
    dist: {
        files: {
          'dist/uglified.min.js': ['dist/PairedUpConcat.js']
        }
      }
    },

    jshint: {
      files: [
        '**/*.js' 
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js',
          'dist/**/*.js', //ignore the concatenated/uglified files.
          'node_modules/**/*.js'
        ]
      }
    },

    cssmin: {
       dist: {
        files: {
          'dist/cssMinFile.min.css': ['public/style.css']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/style.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify'); //saved this dependency.
  grunt.loadNpmTasks('grunt-contrib-jshint'); //saved this dependency.
  grunt.loadNpmTasks('grunt-contrib-watch'); //saved this dependency.
  grunt.loadNpmTasks('grunt-contrib-concat'); //saved this dependency.
  grunt.loadNpmTasks('grunt-contrib-cssmin'); //saved this dependency.
  grunt.loadNpmTasks('grunt-mocha-test'); //saved this dependency.
  grunt.loadNpmTasks('grunt-shell'); //saved this dependency.
  grunt.loadNpmTasks('grunt-nodemon'); //saved this dependency.

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]); // Working theory of this task: USE WATCH FOR A LIVESTREAM OF SERVER ACTIVITY VIA NODEMON
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('concat1', [
    'concat'
  ]); 

  grunt.registerTask('watch', [
    'watch'
  ]); 
  
  grunt.registerTask('uglify', [
    'uglify'
  ]);

  grunt.registerTask('cssmin', [
    'cssmin'
  ]);

  grunt.registerTask('jshint', [
    'jshint'
  ]);

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
      // add your production server task here
  ]);


};


