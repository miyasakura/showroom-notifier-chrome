gulp = require 'gulp'
runSequence = require 'run-sequence'
coffee = require 'gulp-coffee'
uglify = require 'gulp-uglify'
watch = require 'gulp-watch'
plumber = require 'gulp-plumber'

compileConditionDev = {
  compress: {
    global_defs: {
      __SERVER__: 'https://www.showroom-live.com'
      __INTERVAL__: 10
      __EXPIRE__: 600
    }
  }
}

compileCondition = {
  compress: {
    global_defs: {
      __SERVER__: 'https://www.showroom-live.com'
      __INTERVAL__: 60
      __EXPIRE__: 600
    }
  }
}

gulp.task 'manifest-dev', ->
  gulp.src './src/dev/manifest.json'
    .pipe gulp.dest('./extension/')

gulp.task 'manifest-release', ->
  gulp.src './src/release/manifest.json'
    .pipe gulp.dest('./extension/')

gulp.task 'js', ->
  gulp.src './src/*.coffee'
    .pipe(plumber())
    .pipe coffee({bare: true})
    .pipe uglify(compileConditionDev)
    .pipe gulp.dest('./extension/')

gulp.task 'default', (callback) ->
  runSequence(
    ['manifest-dev','js']
    callback
  )

gulp.task 'watch', ->
  gulp.watch(
    './src/*.coffee'
    ['manifest-dev', 'js']
  )

gulp.task 'release', ->
  gulp.run 'manifest-release'
  gulp.src './src/*.coffee'
    .pipe coffee()
    .pipe uglify(compileCondition)
    .pipe gulp.dest('./extension/')
