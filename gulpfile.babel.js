import gulp from 'gulp'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import eslint from 'gulp-eslint'
import concat from 'gulp-concat'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import del from 'del'
import livereload from 'gulp-livereload'

const dirs = {
  dest: 'public/assets/',
  src: 'src/',
  styles: 'src/styles/',
  scripts: 'src/scripts/',
  libs: 'src/libs/',
  clean: ['public/assets/**/*.js', 'public/assets/**/*.css', 'public/assets/**/*.map']
}

export const clean = () => del(dirs.clean)
export const styles = () =>
  gulp.src(`${dirs.styles}app.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.dest))

export const scripts = () =>
  gulp.src(`${dirs.scripts}**/*.js`)
    .pipe(eslint())
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(gulp.dest(dirs.dest))

export const libs = () =>
  gulp.src(`${dirs.libs}**/*.js`)
    .pipe(gulp.dest(dirs.dest))

export const reload = () => livereload.reload()

export const watch = () => {
  livereload.listen()
  gulp.watch(`${dirs.styles}**/*.scss`, styles)
  gulp.watch(`${dirs.scripts}**/*.js`, scripts)
  gulp.watch('public/**/*', reload)
}

export const build = gulp.parallel(styles, libs, scripts)
export default gulp.parallel(watch, build)
