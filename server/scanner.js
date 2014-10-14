module.exports = (function() {

  var sanity = require('./sanity');

  return {
    scanImage: function(job, callback) {
      var exec = require('child_process').exec,
          child;
      child = exec('scanimage --resolution ' + job.res + ' | convert - ' + sanity.translateFile(job.filename) + ' 2>' + sanity.translateFile(job.filename + '.txt'));
      child.on('exit', function () {
        callback(job.filename);
      });
    }
  };

}());
