var express = require('express.io');
var app = express();
app.http().io();
var exec = require('child_process').exec,
  child;
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


var completed = function (file, type) {
  var completed = {"filename": file};
  if (type !== 'preview') {
    completedImages.push(completed);
  }
  console.log('SEND: ' + type + 'Complete');
  app.io.broadcast(type + 'Complete', completed);
  app.io.broadcast('updated', {scans: completedImages});
};

var scanimage = function (job, callback) {
  var filename = job.filename,
    res = job.res;
  console.log('BEGIN: Scan ' + filename);
  child = exec('scanimage --resolution ' + res + ' | convert - ' + scannedPrefix + filename + ' 2>' + scannedPrefix + filename + '.txt');
  child.on('exit', function (code, signal) {
    callback(filename);
  });
};

var readExistingScans = function () {
  fs.readdir(scannedPrefix, function (err, files) {
    for (var i = 0; i < files.length; i++) {
      fs.stat(files[i],function(err,stats) {
        if(stats.isFile() && files[i].indexOf(".png") !== -1) {
            completedImages.push(path.basename(files[i]));
        }
      });
    }
  });
};


var queue = async.queue(scanimage,1);

queue.drain = function() {
  console.log('All scans completed!');
};

app.get('/api/preview', function (req, res) {
  queue.push({'filename':'preview.png','res':75}, function(file) {
    completed(file,'preview');
  });
}); 

app.get('/api/scanimage', function (req, res) {
  var filename = req.param('filename');
  queue.push({'filename':filename,res:300},function(file) {
    completed(file,'scan');
  });
  res.send('Queued: ' + filename);
});

app.get('/api/completed', function (req, res) {
  var id = req.param('id');
  if(id === null || typeof(id) === "undefined") {
      res.send(completedImages);
  }
  else {
      res.download(scannedPrefix + completedImages[id]);
  }
});

app.get('/api/remove', function(req,res) {
  var id = req.param('id');
  var filename = completedImages.splice(id);
  exec('rm ' + filename);
  res.send('Removed item '+ filename);
});

app.io.route('ready', function(req) {
  //req.join('scans');
  console.log("scans requested");
  req.io.emit('updated',{scans:completedImages});
});

app.get('/web', function (req, res) {
  res.render('index2', { title: 'The index page!' });
});

app.io.on('connection',function(s) { console.log("connected");});

app.listen(3000);
