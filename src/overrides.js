const {parallel, series, src, dest, watch} = require('gulp');

const path = require('path');

const config = require('./config.js');

const basePath = '../overrides';

function copySite() {
	return src(path.join(basePath, 'site', '/**'))
		.pipe(dest(path.join(config.wwwDir, 'templates', config.template)));
}

function watchSite() {
	return watch(
		path.join(basePath, 'site', '/**'),
		copySite
	);
}

function copyAdmin() {
	return src(path.join(basePath, 'admin', '/**'))
		.pipe(dest(path.join(config.wwwDir, 'administrator/templates', config.admin_template)));
}

function watchAdmin() {
	return watch(
		path.join(basePath, 'admin', '/**'),
		copyAdmin
	);
}

exports.copy  = parallel(copySite, copyAdmin);
exports.watch = parallel(watchSite, watchAdmin);
