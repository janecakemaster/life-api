import gulp from 'gulp'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import eslint from 'gulp-eslint'
import concat from 'gulp-concat'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import clean from 'gulp-clean'
import livereload from 'gulp-livereload'

const dirs = {
  dest: 'public/',
  src: 'src/',
  styles: 'src/styles/',
  scripts: 'src/scripts/',
  build: ['public/css', 'public/js']
}

gulp.task('styles', () => {
  return gulp.src(`${dirs.styles}app.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${dirs.dest}/css`))
})

gulp.task('scripts', () => {
  return gulp.src(`${dirs.scripts}**/*.js`)
    .pipe(eslint())
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(gulp.dest(`${dirs.dest}/js`))
})

gulp.task('clean', () => {
  return gulp.src(dirs.build)
    .pipe(clean())
})

gulp.task('reload', ['styles', 'scripts'], () => {
  livereload.reload()
})

gulp.task('watch', () => {
  livereload.listen()
  gulp.watch(`${dirs.styles}**/*.scss`, ['styles'])
  gulp.watch(`${dirs.scripts}**/*.js`, ['scripts'])
  gulp.watch(`${dirs.dest}**/*`, ['reload'])
})

gulp.task('build', ['styles', 'scripts'])
gulp.task('default', ['watch', 'build'])
