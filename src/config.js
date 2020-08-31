const fs = require('fs');

const defaultConfig = require('../gulp-config.dist.json');
let config = Object.assign({}, defaultConfig);

if (fs.existsSync('./gulp-config.json')) {
	config = Object.assign(config, require('../gulp-config.json'));
}

module.exports = config;
