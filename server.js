"use strict";
var express = require('express.io');
var app = express();
app.http().io();
var exec = require('child_process').exec;
var async = require('async');
var path = require('path');
var fs = require('fs');
var scannedPrefix = __dirname + '/scanned/';
var completedImages = [];
var oneDay = 86400000;

app.set('view engine', 'ejs');
app.use(express.compress());
app.use('/static', express.static(__dirname + '/public'), { maxAge: oneDay });
app.use('/scans', express.static(scannedPrefix));
// TODO: Tidy up scannedPrefix appending
// TODO: Sanitise input against quotes,slashes in filename

var bootServer = function(app,port) {
  fs.mkdir(scannedPrefix, "0744", function(err) {
    if (err) {
      if (err.code !== 'EEXIST') {
        process.exit(1);
      }
    }
  });
  readExistingScans();
  app.listen(port);
};

var queue = async.queue(scanImage,1);

queue.drain = function() {
  console.log('All scans completed!');
};

app.sanityLib = {
  queueJob: function(job, callback) {
    queue.push(job,callback);
  },
  scanCompleted: function(file, type) {
    var completed = {"filename": file};
    if (type !== 'preview') {
      completedImages.push(completed);
    }
    console.log('SEND: ' + type + 'Complete');
    app.io.broadcast(type + 'Complete', completed);
    app.io.broadcast('updated', {scans: completedImages});
  },
  getCompletedImages: function() {
    return completedImages;
  },
  getCompletedImage: function(i) {
    return completedImages[i];
  },
  removeCompletedImage: function(i) {
    var filename = completedImages.splice(i);
    exec('rm ' + filename);
    return filename;
  },
  translateFile: function (filename) {
    return scannedPrefix + filename;
  }
};

var scanner = require('__dirname/server/scanner')(app);

var scanImage = function (job, callback) {
  console.log('BEGIN: Scan ' + job.filename);
  scanner.scanImage(job.filename,{res:job.res}, callback);
};

var readExistingScans = function () {
  fs.readdir(scannedPrefix, function (err, files) {
    for (var i = 0; i < files.length; i++) {
      var filePath = app.sanityLib.translateFile(files[i]);
      fs.stat(filePath, function (err, stats) {
        console.log(filePath);
        if (stats.isFile() && filePath.indexOf(".png") !== -1) {
          app.sanityLib.scanCompleted(path.basename(files[i-1]),"scan");
        }
      });
    }
  });
};

require("./server/api")(app);

app.io.route('ready', function(req) {
  //req.join('scans');
  console.log("scans requested");
  req.io.emit('updated',{scans:completedImages});
});

app.get('/', function (req, res) {
  res.render('index', { title: 'The index page!' });
});

app.io.on('connection',function() { console.log("connected");});

bootServer(app,3000);


