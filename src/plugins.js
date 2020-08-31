const gulp   = require('gulp');
const del    = require('del');
const fs     = require('fs');
const path   = require('path');
const config = require('./config.js');

const extPath = '../extensions/plugins';

function extPluginPath (group, name) {
	return path.join(extPath, group, name);
}

function sitePluginPath (group, name) {
	return path.join(config.wwwDir, 'plugins', group, name);
}

function pluginName (group, name) {
	return 'plg_' + group + '_' + name;
}

function clean (group, name) {
	const fn = gulp.parallel(
		function cleanPlugin() {
			return del(sitePluginPath(group, name), {force: true})
		},
		function cleanCli() {
			return del(path.join(config.wwwDir, 'cli', pluginName(group, name)), {force: true})
		}
	);

	fn.displayName = 'plugin:' + pluginName(group, name) + ':clean';

	return fn;
}

function copy (group, name) {
	const fn = () => {
		return gulp.src(path.join(extPluginPath(group, name), '/**'))
			.pipe(gulp.dest(sitePluginPath(group, name)))
	};

	fn.displayName = 'plugin:' + group + ':' + name + ':copy';

	const fnCli = () => {
		return gulp.src(path.join(extPluginPath(group, name), '/cli/**'))
			.pipe(gulp.dest(path.join(config.wwwDir, 'cli', pluginName(group, name))))
	};
	fnCli.displayName = 'plugin:' + group + ':' + name + ':copy-cli';

	return gulp.parallel(fn, fnCli);
}

function watch (group, name) {
	return () => {
		return gulp.watch(path.join(extPluginPath(group, name), '/**'),
			gulp.series(clean(group, name), copy(group, name))
		);
	};
}

const cleanTasks = [];
const copyTasks  = [];
const watchTasks = [];

if (fs.existsSync(extPath)) {
	fs.readdirSync(extPath).forEach(group => {
		fs.readdirSync(path.join(extPath, group)).forEach(name => {
			gulp.task('clean:plugin:' + pluginName(group, name), clean(group, name));
			cleanTasks.push('clean:plugin:' + pluginName(group, name));

			gulp.task('copy:plugin:' + pluginName(group, name), copy(group, name));
			copyTasks.push('copy:plugin:' + pluginName(group, name));

			gulp.task('watch:plugin:' + pluginName(group, name), watch(group, name));
			watchTasks.push('watch:plugin:' + pluginName(group, name));
		});
	});
}

exports.cleanTasks = cleanTasks;
exports.copyTasks  = copyTasks;
exports.watchTasks = watchTasks;

exports.clean = cleanTasks.length ? gulp.parallel(...cleanTasks) : (cb) => cb();
exports.copy  = copyTasks.length ? gulp.parallel(...copyTasks) : (cb) => cb();
exports.watch = copyTasks.length ? gulp.parallel(...watchTasks) : (cb) => cb();
