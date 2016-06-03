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
  dest: 'public/assets/',
  src: 'src/',
  styles: 'src/styles/',
  scripts: 'src/scripts/',
  libs: 'src/libs/',
  clean: ['public/assets/**/*.js', 'public/assets/**/*.css', 'public/assets/**/*.map']
}

gulp.task('clean', () => {
  return gulp.src(dirs.clean, {read: false})
    .pipe(clean())
})

gulp.task('styles', () => {
  return gulp.src(`${dirs.styles}app.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.dest))
})

gulp.task('scripts', () => {
  return gulp.src(`${dirs.scripts}**/*.js`)
    .pipe(eslint())
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(gulp.dest(dirs.dest))
})

gulp.task('libs', () => {
  return gulp.src(`${dirs.libs}**/*.js`)
    .pipe(gulp.dest(dirs.dest))
})

gulp.task('reload', () => {
  livereload.reload()
})

gulp.task('watch', () => {
  livereload.listen()
  gulp.watch(`${dirs.styles}**/*.scss`, ['styles'])
  gulp.watch(`${dirs.scripts}**/*.js`, ['scripts'])
  gulp.watch('public/**/*', ['reload'])
})

gulp.task('build', ['styles', 'libs', 'scripts'])
gulp.task('default', ['watch', 'build'])
