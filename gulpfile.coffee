gulp  = require "gulp"
gutil = require "gulp-util"
paths =
	sources :
		base    : "sources"
		postcss : "sources/postcss"
		coffee  : "sources/coffee"
	distrib :
		base    : "dist"
		css     : "dist/css"
		js      : "dist/js"

gulp.task "postcss", ["clean-css"], ->
	postcss = require "gulp-postcss"
	debug   = require "gulp-debug"

	processors = [
		require("autoprefixer-core")(browsers : ["> 1%", "IE 7"])
		require("postcss-nested")
	]

	gulp
		.src  "#{paths.sources.postcss}/*.css"
		.pipe postcss processors
		.pipe gulp.dest paths.distrib.css
		.pipe debug   title : "postCSS"
		.on   "error", gutil.log

gulp.task "postcss-minify", ["postcss"], ->
	minify = require "gulp-minify-css"
	rename = require "gulp-rename"
	debug  = require "gulp-debug"

	gulp
		.src "#{paths.distrib.css}/*.css"
		.pipe minify()
		.pipe rename extname : ".min.css"
		.pipe gulp.dest paths.distrib.css
		.pipe debug  title : "CSS minified"

gulp.task "coffee", ["clean-js"], ->
	coffee = require "gulp-coffee"
	debug  = require "gulp-debug"

	gulp
		.src "#{paths.sources.coffee}/*.coffee"
		.pipe coffee()
		.pipe gulp.dest paths.distrib.js
		.pipe debug  title : "Coffee"
		.on   "error", gutil.log

gulp.task "coffee-minify", ["coffee"], ->
	uglify = require "gulp-uglify"
	rename = require "gulp-rename"
	debug  = require "gulp-debug"

	gulp
		.src "#{paths.distrib.js}/*.js"
		.pipe uglify preserveComments : "all"
		.pipe rename extname : ".min.js"
		.pipe gulp.dest paths.distrib.js
		.pipe debug  title : "Coffee minified"

gulp.task "clean-css", ->
	clean = require "gulp-clean"
	debug = require "gulp-debug"

	gulp
		.src  "#{paths.distrib.base}/**/*.css", read : false
		.pipe debug title : "Clean CSS"
		.pipe clean()

gulp.task "clean-js", ->
	clean = require "gulp-clean"
	debug = require "gulp-debug"

	gulp
		.src  "#{paths.distrib.base}/**/*.js", read : false
		.pipe debug title : "Clean JS"
		.pipe clean()

gulp.task "build", ->
	gulp.start "postcss-minify"
	gulp.start "coffee-minify"

gulp.task "watch", ->
	gulp.watch "#{paths.sources.coffee}/**/*.coffee", ["coffee-minify"]
	gulp.watch "#{paths.sources.postcss}/**/*.css"  , ["postcss-minify"]
