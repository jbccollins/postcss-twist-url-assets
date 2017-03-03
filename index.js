var postcss = require('postcss');
var path = require("path");
var fs = require('fs');

// Credit: http://stackoverflow.com/a/6582214
var extensionPattern=/\.[0-9a-z]{1,5}$/i;
var urlPattern = /url\(([^)]+)\)/;

/**
 * @name twistUrlAssets
 * @description Build this documentation with "npm run doc"
 * This is a small postcss plugin that will transform relative url paths.
 * 
 * My use case: 
 * Some npm packages use relative urls in their css. This is fine and dandy until you 
 * mash all your css together into one big file in some src directory and those relative 
 * urls no longer point to where they're supposed to. To fix this we can copy the image 
 * resources to a "dump" directory and change all the urls to be consistent and correct. 
 * Yay.
 *
 * @example <caption>Example usage of twistUrlAssets().</caption>
 * // Given: (style.css)
 * // .one {
 * //   background-image: url("images/center_icon.png");
 * // }
 * // .two {
 * //   background-image: url("cog.png");
 * // }
 * // .three {
 * //   background-image: url(data:image/gif;base64,R0lGODlh...IQA7);
 * // }
 * // .four {
 * //   background-image: url("/ignored_asset.png");
 * // }
 * // .five {
 * //   background-image: url("../example.svg");
 * // }
 *
 * // Ouput:
 * // .one {
 * //    background-image: url("/static/images/style_dumped_center_icon.png");
 * //  }
 * //  .two {
 * //    background-image: url("/static/images/style_dumped_cog.png");
 * //  }
 * //  .three {
 * //    background-image: url(data:image/gif;base64,R0lGODlh...IQA7);
 * //  }
 * //  .four {
 * //    background-image: url("/ignored_asset.png");
 * //  }
 * //  .five {
 * //    background-image: url("/static/images/style_dumped_example.svg");
 * //  }
 *
 * // Gulp
 * var gulp = require('gulp');
 * var postcss = require('gulp-postcss');
 *
 * var twistUrlAssets = require('postcss-twist-url-assets');
 *
 * gulp.task('css', function () {
 *   var processors = [
 *     twistUrlAssets('/static/images', '/opt/demo_gulp_twist_postcss/dest/static/images')
 *   ];
 *   return gulp.src('./src/*.css')
 *     .pipe(postcss(processors))
 *     .pipe(gulp.dest('./dest'));
 * });
 *
 * // rollup-plugin-sass
 * var postcss = require('postcss');
 * var twistUrlAssets = require('postcss-twist-url-assets');
 * ...
 * sass({
 *   ...
 *   processor(code, id) {
 *     return postcss([twistUrlAssets('/static/images', '/opt/demo_rollup_twist_postcss/dest/static/images')])
 *       .process(code, {from: id})
 *       .then((result) => {
 *         return result.css;
 *       });
 *   },
 *   ...
 * })
 *
 * @param {string} newUrlPathPrefix - The prefix that will be prepended to the generated image file. This will determine the path that the server uses to query for the image resource. eg "/static/images/dumped_assets"
 * @param {string} dumpDirectoryPath - The place that you want to dump your image resorces. eg "/opt/path/to/static/images/dumped_assets"
 */
module.exports = postcss.plugin('twistUrlAssets', function (newUrlPathPrefix, dumpDirectoryPath) {

  return function (css) {

    if (typeof dumpDirectoryPath === 'undefined') {
      console.log('You MUST specify a directory into which image resources will be dumped. Skipping ' + css.source.input.file);
      return;
    }

    if (typeof newUrlPathPrefix === 'undefined') {
      console.log('You MUST specify a path prefix for your images. Skipping ' + css.source.input.file);
      return;
    }

    css.walkRules(function (rule) {
      rule.walkDecls(function (decl, i) {
        var value = decl.value;
        if (value.indexOf( 'url(' ) !== -1) {
          // Get the url requested by matching the string inside the brackets of url().
          // Then replace any double or single quotes therein.
          var urlPath = value.match(urlPattern)[1].replace(/["']/g, '');

          // Check against the regex for file extensions
          var urlExtension = urlPath.match(extensionPattern);

          // No extension implies that the url is not referencing a file (eg. dataURI).
          // Starting with '/' means that the url is already absolute.
          // Containing '://' implies a web url like http, https, ftp etc'
          if (!urlExtension 
              || urlPath.toString().startsWith('/')
              || urlPath.indexOf('://') > -1) {
            return;
          }

          // Construct a unique new file name/path based on the input css file being processed
          var strippedInputFileName = path.basename(css.source.input.file).replace(extensionPattern, '');
          var baseUrlFileName = path.basename(urlPath);
          var outputFileName = '_dumped_' + baseUrlFileName;
          var outputFilePath = strippedInputFileName + outputFileName;

          // Strip the file name from the input file path
          var inputFilePath = css.source.input.file.replace(/[^\/]*$/, '');

          // Path from root to file. Something like /opt/my/project/path/image.png
          var rootPathToFile = path.resolve(inputFilePath  + urlPath);

          // Copy the file to our static directory
          var inStr = fs.createReadStream(rootPathToFile);
          var outStr = fs.createWriteStream(dumpDirectoryPath + "/" + outputFilePath);
          inStr.pipe(outStr);

          // Send the new value back into the stylesheet
          decl.value = value.replace(urlPattern, 'url("' + newUrlPathPrefix + "/" + outputFilePath + '")');
        }
      });
    });
  }
});