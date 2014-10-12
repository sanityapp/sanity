module.exports = function() {

  var async = require('async');
  var scanner = require('./scanner');
  var fs = require('fs');
  var path = require('path');
  var exec = require('child_process').exec;
  var completedImages = [];
  var scannedPrefix = __dirname + '/../scanned/'; // TODO: move to config file

  var queue = async.queue(scanner.scanImage,1);

  queue.drain = function() {
    console.log('All scans completed!');
  };

  return {
    queueJob: function(job, callback) {
      queue.push(job,callback);
    },
    scanCompleted: function(file, type) {
      var app = require('../server');
      var completed = {"filename": file};
      if (type !== 'preview') {
        completedImages.push(completed);
      }
      app.io.broadcast(type + 'Complete', completed);
      app.io.broadcast('updated', {scans: completedImages});
    },
    getCompletedImages: function() {
      return completedImages;
    },
    getCompletedImage: function(i) {
      return this.getCompletedImages()[i];
    },
    removeCompletedImage: function(i) {
      var filename = completedImages.splice(i);
      exec('rm ' + filename);
      return filename;
    },
    translateFile: function (filename) {
      return scannedPrefix + filename;
    },
    loadExistingScans: function() {
      var self = this;
      fs.readdir(scannedPrefix, function (err, files) {
        for (var i = 0; i < files.length; i++) {
          var filePath = self.translateFile(files[i]);
          fs.stat(filePath, function (err, stats) {
            if (stats.isFile() && filePath.indexOf(".png") !== -1) {
              self.scanCompleted(path.basename(files[i-1]),"scan");
            }
          });
        }
      });
    }
  };

}();
