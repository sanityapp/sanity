"use strict";
var express = require('express.io');
var app = module.exports = express();
app.http().io();
var fs = require('fs');
var sanity = require('./server/sanity');
var scannedPrefix = __dirname + '/scanned/'; // TODO: move to config file
var oneDay = 86400000;

app.set('view engine', 'ejs');
app.use(express.compress());
app.use('/static', express.static(__dirname + '/public'), { maxAge: oneDay });
app.use('/scans', express.static(scannedPrefix));

// TODO: Sanitise input against quotes,slashes in filename

var bootServer = function(app,port) {
  fs.mkdir(scannedPrefix, "0744", function(err) {
    if (err) {
      if (err.code !== 'EEXIST') {
        process.exit(1);
      }
    }
  });
  sanity.loadExistingScans();
  app.listen(port);
  console.log("Serve listening on port " + port);
};

require('./server/api')(app);

app.io.route('ready', function(req) {
  //req.join('scans');
  console.log("scans requested");
  req.io.emit('updated',{scans:sanity.getCompletedImages()});
});

app.get('/', function (req, res) {
  res.render('index', { title: 'The index page!' });
});

app.io.on('connection',function() { console.log("connected");});

bootServer(app,3000);


