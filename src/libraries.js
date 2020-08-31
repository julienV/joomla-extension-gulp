const {task, parallel, series, src, dest, watch} = require('gulp');

const del  = require('del');
const fs   = require('fs');
const path = require('path');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const config = require('./config.js');

const extPath    = '../extensions/libraries';

function cleanSite(name) {
	const fn = () => {
		return del(config.wwwDir + '/libraries/' + name, {force: true});
	};
	fn.displayName = 'library:' + name + ':clean';

	return fn;
}

function copySite(name) {
	const fn = () => {
		return src(path.join(extPath, name, '/**'))
			.pipe(dest(path.join(config.wwwDir, 'libraries', name)));
	};
	fn.displayName = 'library:' + name + ':copy';

	return fn;
}

function watchSite(name) {
	const fn = () => {
		return watch(path.join(extPath, name, '/**'), series(cleanSite(name), copySite(name)));
	}
	fn.displayName = 'library:' + name + ':watch';

	return fn;
}

const cleanTasks = [];
const copyTasks  = [];
const watchTasks = [];

if (fs.existsSync(extPath)) {
	const libraries = fs.readdirSync(extPath);

	libraries.forEach(name => {
		task('clean:library:' + name, cleanSite(name));
		cleanTasks.push('clean:library:' + name);

		task('copy:library:'  + name, series('clean:library:' + name, copySite(name)));
		copyTasks.push('copy:library:' + name);

		task('watch:library:' + name, watchSite(name));
		watchTasks.push('watch:library:' + name);
	});
}

exports.cleanTasks = cleanTasks;
exports.copyTasks  = copyTasks;
exports.watchTasks = watchTasks;

exports.clean = cleanTasks.length ? parallel(...cleanTasks) : (cb) => cb();
exports.copy  = copyTasks.length ? parallel(...copyTasks) : (cb) => cb();
exports.watch = copyTasks.length ? parallel(...watchTasks) : (cb) => cb();