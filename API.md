<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

# index

**Parameters**

-   `newUrlPathPrefix` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The prefix that will be appended to the generated image file. This will determine the path that the server uses to query for the image resource. eg "/static/images/dumped_assets"
-   `dumpDirectoryPath` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The place that you want to dump your image resorces. eg "/opt/path/to/static/images/dumped_assets"

**Examples**

_Example usage of twistUrlAssets()._

```javascript
// Given: (style.css)
// .one {
//     background-image: url("images/center_icon.png");
// }
// .two {
//   background-image: url("cog.png");
// }
// .three {
//   background-image: url(data:image/gif;base64,R0lGODlh...IQA7);
// }
// .four {
//   background-image: url("/ignored_asset.png");
// }
// .five {
//   background-image: url("../example.svg");
// }

// Ouput:
// .one {
//    background-image: url("/static/images/style_dumped_center_icon.png");
//  }
//  .two {
//    background-image: url("/static/images/style_dumped_cog.png");
//  }
//  .three {
//    background-image: url(data:image/gif;base64,R0lGODlh...IQA7);
//  }
//  .four {
//    background-image: url("/ignored_asset.png");
//  }
//  .five {
//    background-image: url("/static/images/style_dumped_example.svg");
//  }

// Gulp
var gulp = require('gulp');
var postcss = require('gulp-postcss');

var twistUrlAssets = require('postcss-twist-url-assets');

gulp.task('css', function () {
  var processors = [
    twistUrlAssets('/static/images', '/opt/demo_gulp_twist_postcss/dest/static/images')
  ];
  return gulp.src('./src/*.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest'));
});

// rollup-plugin-sass
var postcss = require('postcss');
var twistUrlAssets = require('postcss-twist-url-assets');
...
sass({
  ...
  processor(code, id) {
    return postcss([twistUrlAssets('/static/images', '/opt/demo_rollup_twist_postcss/dest/static/images')])
      .process(code, {from: id})
      .then((result) => {
        return result.css;
      });
  },
  ...
})
```