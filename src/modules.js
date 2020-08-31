const gulp   = require('gulp');
const del    = require('del');
const fs     = require('fs');
const path   = require('path');

const sass     = require('gulp-sass');
sass.compiler  = require('node-sass');
const cleanCSS = require('gulp-clean-css');
const rename   = require('gulp-rename');
const uglify   = require('gulp-uglify');
const concat   = require('gulp-concat');
const gutil    = require('gulp-util');

const config = require('./config.js');

const assetsPath = '../assets/modules/site'
const extPath    = '../extensions/modules/site';

function compileScss(name) {
	const task = () => {
		const basePath = path.join(assetsPath, name, 'scss/**/*')
		return gulp.src(basePath)
			.pipe(sass().on('error', sass.logError))
			.pipe(gulp.dest(path.join(extPath, name, 'media/css/')))
			.pipe(cleanCSS({compatibility: 'ie8'}))
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(gulp.dest(path.join(extPath, name, 'media/css/')));
	}
	task.displayName = 'compile scss ' + name;

	return task;
}

function cleanModule (name) {
	const fn = () => {
		return del(config.wwwDir + '/modules/' + name, {force: true});
	};

	fn.displayName = 'module:' + name + ':clean:module';

	return fn;
}

function copyModule (name) {
	const fn = () => {
		return gulp.src(path.join(extPath, name, '/**'))
			.pipe(gulp.dest(path.join(config.wwwDir, 'modules', name)));
	};
	fn.displayName = 'module:' + name + ':copy:module';

	return fn;
}

function cleanMedia (name) {
	const fn = () => {
		return del(config.wwwDir + '/media/' + name, {force: true});
	};
	fn.displayName = 'module:' + name + ':clean:media';

	return fn;
}

function copyMedia (name) {
	const fn = () => {
		return gulp.src(path.join(extPath, name, '/media/**'))
			.pipe(gulp.dest(config.wwwDir + '/media/' + name));
	};

	fn.displayName = 'module:' + name + ':copy:media';

	return fn;
}

function clean (name) {
	return gulp.parallel(cleanMedia(name), cleanModule(name));
}

function copy (name) {
	return gulp.parallel(copyMedia(name), copyModule(name));
}

function watch (name) {
	// return () => {
		const tasks = [];
		const basePath = path.join(extPath, name);

		const taskWatch = () => {
			return gulp.watch(
				path.join(basePath, '**'),
				gulp.series(clean(name), copy(name))
			);
		};
		taskWatch.displayName = 'watch module ' + name;
		tasks.push(taskWatch);

		const jsAssets = path.join(assetsPath, name, 'js');

		if (fs.existsSync(jsAssets)) {
			const taskWatchJs = () => {
				return gulp.watch(
					path.join(jsAssets, '**'),
					compileScripts(name)
				);
			};
			taskWatchJs.displayName = 'watch module js ' + name;
			tasks.push(taskWatchJs);
		}

		const scssAssets = path.join(assetsPath, name, 'scss');

		if (fs.existsSync(scssAssets)) {
			const taskWatchScss = () => {
				return gulp.watch(
					path.join(scssAssets, '**'),
					compileScss(name)
				);
			};
			taskWatchScss.displayName = 'watch module scss ' + name;
			tasks.push(taskWatchScss);
		}

		return gulp.parallel(tasks);
	// };
}

const cleanTasks = [];
const copyTasks  = [];
const watchTasks = [];

if (fs.existsSync(extPath)) {
	const modules = fs.readdirSync(extPath);

	modules.forEach(name => {
		gulp.task('clean:module:' + name, clean(name));
		cleanTasks.push('clean:module:' + name);

		gulp.task('copy:module:' + name, gulp.series(clean(name), copy(name)));
		copyTasks.push('copy:module:' + name);

		gulp.task('watch:module:' + name, watch(name));
		watchTasks.push('watch:module:' + name);
	});
}

exports.cleanTasks = cleanTasks;
exports.copyTasks  = copyTasks;
exports.watchTasks = watchTasks;

exports.clean = cleanTasks.length ? gulp.parallel(...cleanTasks) : (cb) => cb();
exports.copy  = copyTasks.length ? gulp.parallel(...copyTasks) : (cb) => cb();
exports.watch = copyTasks.length ? gulp.parallel(...watchTasks) : (cb) => cb();
