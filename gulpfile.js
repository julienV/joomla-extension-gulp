const gulp       = require('gulp');
const config     = require('./src/config');
const components = require('./src/components');
const libraries  = require('./src/libraries');
const modules    = require('./src/modules');
const plugins    = require('./src/plugins');
const overrides  = require('./src/overrides');

let cleanTasks = [];
cleanTasks = components.cleanTasks.length > 0 ? cleanTasks.concat(...components.cleanTasks) : cleanTasks;
cleanTasks = libraries.cleanTasks.length > 0 ? cleanTasks.concat(...libraries.cleanTasks) : cleanTasks;
cleanTasks = modules.cleanTasks.length > 0 ? cleanTasks.concat(...modules.cleanTasks) : cleanTasks;
cleanTasks = plugins.cleanTasks.length > 0 ? cleanTasks.concat(...plugins.cleanTasks) : cleanTasks;

let copyTasks = [];
copyTasks = components.copyTasks.length > 0 ? copyTasks.concat(...components.copyTasks) : copyTasks;
copyTasks = libraries.copyTasks.length > 0 ? copyTasks.concat(...libraries.copyTasks) : copyTasks;
copyTasks = modules.copyTasks.length > 0 ? copyTasks.concat(...modules.copyTasks) : copyTasks;
copyTasks = plugins.copyTasks.length > 0 ? copyTasks.concat(...plugins.copyTasks) : copyTasks;

let watchTasks = [];
watchTasks = components.watchTasks.length > 0 ? watchTasks.concat(...components.watchTasks) : watchTasks;
watchTasks = libraries.watchTasks.length > 0 ? watchTasks.concat(...libraries.watchTasks) : watchTasks;
watchTasks = modules.watchTasks.length > 0 ? watchTasks.concat(...modules.watchTasks) : watchTasks;
watchTasks = plugins.watchTasks.length > 0 ? watchTasks.concat(...plugins.watchTasks) : watchTasks;

gulp.task('clean', gulp.parallel(cleanTasks));
gulp.task('copy', gulp.parallel(copyTasks, overrides.copy));
gulp.task('watch', gulp.parallel(watchTasks, overrides.watch));

exports.default = gulp.series(config.defaultTasks);
