module.exports = function() {

  var async = require('async');
  var scanner = require('./scanner');
  var fs = require('fs');
  var path = require('path');
  var exec = require('child_process').exec;
  var completedImages = {};
  var scannedPrefix = __dirname + '/../scanned/'; // TODO: move to config file

  var queue = async.queue(scanner.scanImage,1);

  queue.drain = function() {
    console.log('All scans completed!');
  };

  var isSupportedFile = function(filePath) {
    return /(.png|.jpg)$/.test(filePath);
  }

  var processFileStats = function(filePath,callback) {
    return function(err,stats) {
      if (stats.isFile() && isSupportedFile(filePath)) {
        callback(path.basename(filePath),"scan");
      }
    };
  };

  var app = require('../server');
  
  var broadcastUpdate = function() {
    app.io.broadcast('updated', {scans: completedImages});
  };

  var translateFile = function(filename) { 
    return scannedPrefix + filename;
  };

  return {
    queueJob: function(job, callback) {
      queue.push(job,callback);
    },
    broadcastUpdate: function() {
      broadcastUpdate();
    },
    scanCompleted: function(file, type) {
      var app = require('../server');
      var completed = {"filename": file};
      if (type !== 'preview') {
        completedImages[file] = completed;
      }
      app.io.broadcast(type + 'Complete', completed);
      broadcastUpdate();
    },
    getCompletedImages: function() {
      return completedImages;
    },
    getCompletedImage: function(index) {
      return this.getCompletedImages()[i];
    },
    removeCompletedImage: function(locator) {
      var i = locator.name;
      console.log("Trying to remove by " + i);
      console.log(completedImages);
      var filename = completedImages[i].filename;
      console.log("Removing: " + filename);
      delete completedImages[i];
      exec('rm ' + translateFile(filename));
      broadcastUpdate();
      return filename;
    },
    translateFile: function (filename) {
      return translateFile(filename);
    },
    loadExistingScans: function() {
      var self = this;
      fs.readdir(scannedPrefix, function (err, files) {
        for (var i = 0; i < files.length; i++) {
          var filePath = self.translateFile(files[i]);
          fs.stat(filePath, processFileStats(filePath,self.scanCompleted));
        }
      });
    }
  };

}();
