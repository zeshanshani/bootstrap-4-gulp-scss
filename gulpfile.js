/**
 * Gulpfile.
 *
 * Gulp with WordPress.
 *
 * Implements:
 *      1. Live reloads browser with BrowserSync.
 *
 * @author Zeshan Ahmed
 * @version 1.0.0
 */

/**
 * Configuration.
 *
 * Project Configuration for gulp tasks.
 *
 * In paths you can add <<glob or array of globs>>. Edit the variables as per your project requirements.
 */

// START Editing Project Variables.
// Project related.
var project              = 'ProjectName'; // Project Name.
var projectURL           = 'https://projectname.localhost'; // Project URL. Could be something like localhost:8888.
var productURL           = './'; // Theme/Plugin URL. Leave it like it is, since our gulpfile.js lives in the root folder.

// Style related.
var styleSRC             = './assets/scss/app.scss'; // Path to main .scss file.
var styleDestination     = './assets/css/'; // Path to place the compiled CSS file.

// JS Custom related.
var jsCustomSRC          = [
    './assets/js/src/**/*.js',
    '!./assets/js/src/vendor/**/*.js',
    './assets/js/src/app.js'
]; // Path to JS custom scripts folder.
var jsCustomDestination  = './assets/js/dist/'; // Path to place the compiled JS custom scripts file.
var jsCustomFile         = 'app'; // Compiled JS custom file name.

// JS Vendor related.
var jsVendorSRC          = [
    // './node_modules/aos/dist/aos.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './assets/js/src/vendor/*.js'
]; // Path to JS custom scripts folder.
var jsVendorDestination  = './assets/js/dist/'; // Path to place the compiled JS custom scripts file.
var jsVendorFile         = 'vendor'; // Compiled JS custom file name.

// Watch files paths.
var styleWatchFiles      = 'assets/scss/**/*.scss'; // Path to all *.scss files inside css folder and inside them.
var customJSWatchFiles   = ['assets/js/src/**/*.js']; // Path to all custom JS files.
var vendorJSWatchFiles   = jsVendorSRC; // Path to all custom JS files.
var projectHTMLWatchFiles = '**/*.html'; // Path to all PHP files.

/**
 * Load Plugins.
 *
 * Load gulp plugins and assing them semantic names.
 */
var gulp = require('gulp' ); // Gulp of-course

// CSS related plugins.
const sass = require('gulp-sass' ); // Gulp plugin for Sass compilation.
const minifycss = require('gulp-uglifycss' ); // Minifies CSS files.
const autoprefixer = require('gulp-autoprefixer' ); // Autoprefixing magic.
const mmq = require('gulp-merge-media-queries' ); // Combine matching media queries into one.

// JS related plugins.
const concat = require('gulp-concat' ); // Concatenates JS files.
const uglify = require('gulp-uglify' ); // Minifies JS files.
const babel = require('gulp-babel' ); // Compiles ESNext to browser compatible JS.

// Utility related plugins.
const rename = require('gulp-rename' ); // Renames files E.g. style.css -> style.min.css.
const lineec = require('gulp-line-ending-corrector' ); // Consistent Line Endings for non UNIX systems. Gulp Plugin for Line Ending Corrector (A utility that makes sure your files have consistent line endings).
const filter = require('gulp-filter' ); // Enables you to work on a subset of the original files by filtering them using a glob.
const sourcemaps = require('gulp-sourcemaps' ); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css).
const notify = require('gulp-notify' ); // Sends message notification to you.
const browserSync = require('browser-sync' ).create(); // Reloads browser and injects CSS. Time-saving synchronized browser testing.
const remember = require('gulp-remember' ); //  Adds all the files it has ever seen back into the stream.
const plumber = require('gulp-plumber' ); // Prevent pipe breaking caused by errors from gulp plugins.

// Helper function to allow browser reload with Gulp 4.
const reload = done => {
	browserSync.reload();
	done();
};

/**
 * Custom Error Handler.
 *
 * @param Mixed err
 */
const errorHandler = r => {
	notify.onError( '\n\n❌  ===> ERROR: <%= error.message %>\n' )( r );
};

// Browsers you care about for autoprefixing.
// Browserlist https://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
    'last 2 version',
    '> 1%',
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4',
    'bb >= 10'
];

/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 *
 * This task does the following:
 *    1. Sets the project URL
 *    2. Sets inject CSS
 *    3. You may define a custom port
 *    4. You may want to stop the browser from openning automatically
 */
gulp.task('browser-sync', () => {
    browserSync.init({
        open: false,
        injectChanges: true,
        // reloadDelay: 1000,
        https: {
            key: "/Users/zeshan/.valet/Certificates/projectname.localhost.key",
            cert: "/Users/zeshan/.valet/Certificates/projectname.localhost.crt"
        },
        port: 3017,
        proxy: projectURL,
    });
});


/**
 * Task: `styles`.
 *
 * Compiles Sass, Autoprefixes it and Minifies CSS.
 *
 * This task does the following:
 *    1. Gets the source scss file
 *    2. Compiles Sass to CSS
 *    3. Writes Sourcemaps for it
 *    4. Autoprefixes it and generates style.css
 *    5. Renames the CSS file with suffix .min.css
 *    6. Minifies the CSS file and generates style.min.css
 *    7. Injects CSS or reloads the browser via browserSync
 */
gulp.task('styles', () => {
    return gulp.src( styleSRC, { allowEmpty: true })
        .pipe( plumber( errorHandler ) )
        .pipe( sourcemaps.init() )
        .pipe(
            sass({
                errLogToConsole: true,
                outputStyle: 'compact',
                precision: 10
            })
        )
        .on( 'error', sass.logError )
        .pipe( sourcemaps.write({ includeContent: false }) )
        .pipe( sourcemaps.init({ loadMaps: true }) )
        .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )
        .pipe( sourcemaps.write( './' ) )
        .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
        .pipe( gulp.dest( styleDestination ) )
        .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files.
        // .pipe( mmq({ log: true }) ) // Merge Media Queries only for .min.css version.
        .pipe( browserSync.stream() ) // Reloads style.css if that is enqueued.
        .pipe( rename({ suffix: '.min' }) )
        .pipe( minifycss({ maxLineLen: 10 }) )
        .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
        .pipe( gulp.dest( styleDestination ) )
        .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files.
        .pipe( browserSync.stream() ) // Reloads style.min.css if that is enqueued.
        .pipe( notify({ message: '\n\n✅  ===> STYLES — completed!\n', onLast: true }) );

    gulp.src( [styleDestination + '*.min.css'], {
            read: false
        })
        .pipe( browserSync.stream() );
});

/**
 * Task: `customJS`.
 *
 * Concatenate and uglify custom JS scripts.
 *
 * This task does the following:
 *     1. Gets the source folder for JS custom files
 *     2. Concatenates all the files and generates custom.js
 *     3. Renames the JS file with suffix .min.js
 *     4. Uglifes/Minifies the JS file and generates custom.min.js
 */
gulp.task('customJS', () => {
	return gulp
		.src( jsCustomSRC ) // Only run on changed files.
		.pipe( plumber( errorHandler ) )
		.pipe(
			babel({
				presets: [
					[
						'@babel/preset-env', // Preset to compile your modern JS to ES5.
						{
							targets: { browsers: AUTOPREFIXER_BROWSERS } // Target browser list to support.
						}
					]
				]
			})
		)
		// .pipe( remember( jsCustomSRC ) ) // Bring all files back to stream.
		.pipe( concat( jsCustomFile + '.js' ) )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( gulp.dest( jsCustomDestination ) )
		.pipe(
			rename({
				basename: jsCustomFile,
				suffix: '.min'
			})
		)
		.pipe( uglify() )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( gulp.dest( jsCustomDestination ) )
		.pipe( notify({ message: '\n\n✅  ===> CUSTOM JS — completed!\n', onLast: true }) );
});

/**
 * Task: `vendorJS`.
 *
 * Concatenate and uglify custom JS scripts.
 *
 * This task does the following:
 *     1. Gets the source folder for JS custom files
 *     2. Concatenates all the files and generates custom.js
 *     3. Renames the JS file with suffix .min.js
 *     4. Uglifes/Minifies the JS file and generates custom.min.js
 */
gulp.task('vendorJS', () => {
	return gulp
		.src( jsVendorSRC ) // Only run on changed files.
		.pipe( plumber( errorHandler ) )
		.pipe( concat( jsVendorFile + '.js' ) )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( gulp.dest( jsVendorDestination ) )
		.pipe(
			rename({
				basename: jsVendorFile,
				suffix: '.min'
			})
		)
		.pipe( uglify() )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( gulp.dest( jsVendorDestination ) )
		.pipe( notify({ message: '\n\n✅  ===> VENDOR JS — completed!\n', onLast: true }) );
});

/**
 * Watch Tasks.
 *
 * Watches for file changes and runs specific tasks.
 */
gulp.task(
    'default',
    gulp.parallel( 'styles', 'customJS', 'vendorJS', 'browser-sync', () => {
        gulp.watch( projectHTMLWatchFiles, reload );
        gulp.watch( styleWatchFiles, gulp.series( 'styles' ) ); // Reload on SCSS file changes.
        gulp.watch( customJSWatchFiles, gulp.series( 'customJS', reload ) );
        gulp.watch( vendorJSWatchFiles, gulp.series( 'vendorJS', reload ) );
    })
);