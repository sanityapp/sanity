module.exports = function(app) {

  return {
    scanImage: function(filename, options, callback) {
      var exec = require('child_process').exec,
          child;
      child = exec('scanimage --resolution ' + options.res + ' | convert - ' + app.sanityLib.translateFile(filename) + ' 2>' + app.sanityLib.translateFile(filename + '.txt'));
      child.on('exit', function () {
        callback(filename);
      });
    }
  };

};