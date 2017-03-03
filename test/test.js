var assert = require('assert');
var fs = require('fs')
var postcss = require('postcss')
var twistUrlAssets = require('..')



function read(name) {
  return fs.readFileSync('test/' + name + '.css', 'utf8').trim()
}

function compareFixtures(name) {
  var pcss = postcss()
  var id = 'test/' + name + '.css';
  pcss.use(twistUrlAssets('/prefix/dumped', 'test/fixtures/dumped'))
  var actual = pcss.process(read('fixtures/' + name), { from: id }).css
  var expected = read('fixtures/' + name + '.expected')
  assert.equal(actual, expected)
}

describe('twistUrlAssets', function() {
  describe('absolute-urls', function() {
    it('should return an identical output file', function() {
      compareFixtures('absolute-urls');
    });
  });
  describe('relative-urls', function() {
    it('should return a different output file', function() {
      compareFixtures('relative-urls');
    });
  });
  describe('asset existence', function() {
    it('should create new image assets', function() {
    var prefix = 'test/fixtures/dumped/relative-urls_dumped_turtle';
    var fileExtensions = ['.gif', '.png', '.jpg'];
    var filePath = null;
      for (var i = 0; i < fileExtensions.length; i++) {
        filePath = prefix + fileExtensions[i];
        try {
          var fileContents = fs.readFileSync(filePath, 'utf8').trim();
        } catch(err) {
          assert.fail(true, false, filePath + ' does not exist');
        }
      }
    });
  });
});