const {task, parallel, series, src, dest, watch} = require('gulp');

const del  = require('del');
const fs   = require('fs');
const path = require('path');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');

const config = require('./config.js');

const extPath    = '../extensions/components';
const assetsPath = '../assets/components';

function cleanAdmin (name) {
	const fn = () => {
		return del(config.wwwDir + '/administrator/components/' + name, {force: true});
	};

	fn.displayName = 'component:' + name + ':clean:component';

	return fn;
}

function copyAdmin(name) {
	const fn = () => {
		return src(path.join(extPath, name, 'admin/**'))
			.pipe(dest(path.join(config.wwwDir, 'administrator/components', name)));
	};
	fn.displayName = 'component:' + name + ':copy:admin';

	return fn;
}

function cleanSite (name) {
	// Not cleaning site, as it contains uploaded files
	return (cb) => cb();
	// return del(config.wwwDir + '/components/com_annonce', {force: true});
}

function copySite(name) {
	const fn = () => {
		return src(path.join(extPath, name, 'site/**'))
			.pipe(dest(path.join(config.wwwDir, 'components', name)));
	};
	fn.displayName = 'component:' + name + ':copy:site';

	return fn;
}

function cleanMedia(name) {
	const fn = () => {
		return del(config.wwwDir + '/media/' + name, {force: true});
	};
	fn.displayName = 'component:' + name + ':delete:media';

	return fn;
}

function copyMedia(name) {
	const fn = () => {
		return src(path.join(extPath, name, '/media/**'))
			.pipe(dest(config.wwwDir + '/media/' + name));
	}
	fn.displayName = 'component:' + name + ':copy:media';

	return fn;
}

function watchAdmin(name) {
	const fn = () => {
		return watch(path.join(extPath, name, '/admin/**'), series(cleanAdmin(name), copyAdmin(name)));
	}
	fn.displayName = 'component:' + name + ':watch:admin';

	return fn;
}

function watchSite(name) {
	const fn = () => {
		return watch(path.join(extPath, name, '/site/**'), series(cleanSite(name), copySite(name)));
	}
	fn.displayName = 'component:' + name + ':watch:site';

	return fn;
}

function watchMedia(name) {
	const fn = () => {
		return watch(path.join(extPath, name, '/media/**'), series(cleanMedia(name), copyMedia(name)));
	}
	fn.displayName = 'component:' + name + ':watch:media';

	return fn;
}

function watchAssets(name) {
	const fnScss = () => {
		return watch(path.join(assetsPath, name, '/scss/**'), buildScss(name));
	}
	fnScss.displayName = 'component:' + name + ':watch:assets:scss';

	const fnJs = () => {
		return watch(path.join(assetsPath, name, '/js/**'), buildJs(name));
	}
	fnJs.displayName = 'component:' + name + ':watch:assets:js';

	return parallel(fnScss, fnJs);
}

function buildScss(name) {
	const fn = () => {
		return src(path.join(assetsPath, name, 'scss/*.scss'))
			.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError))
			.pipe(sourcemaps.write('./maps'))
			.pipe(dest(path.join(extPath, name, '/media/css')));
	};
	fn.displayName = 'component:' + name + ':assets:buildScss';

	return fn;
}

function buildJs(name) {
	const fn = (cb) => {

		return cb();
	};
	fn.displayName = 'component:' + name + ':assets:buildJs';

	return fn;
}

const cleanTasks = [];
const copyTasks  = [];
const watchTasks = [];

if (fs.existsSync(extPath)) {
	const components = fs.readdirSync(extPath);

	components.forEach(name => {
		task('clean:component:' + name, parallel(cleanAdmin(name), cleanSite(name), cleanMedia(name)));
		cleanTasks.push('clean:component:' + name);

		task('copy:component:'  + name, series('clean:component:' + name, parallel(copyAdmin(name), copySite(name), copyMedia(name))));
		copyTasks.push('copy:component:' + name);

		task('watch:component:' + name, parallel(watchSite(name), watchAdmin(name), watchMedia(name)));
		watchTasks.push('watch:component:' + name);

		task('watch:assets:' + name, watchAssets(name));
		watchTasks.push('watch:assets:' + name);
	});
}

exports.cleanTasks = cleanTasks;
exports.copyTasks  = copyTasks;
exports.watchTasks = watchTasks;

exports.clean = cleanTasks.length ? parallel(...cleanTasks) : (cb) => cb();
exports.copy  = copyTasks.length ? parallel(...copyTasks) : (cb) => cb();
exports.watch = copyTasks.length ? parallel(...watchTasks) : (cb) => cb();