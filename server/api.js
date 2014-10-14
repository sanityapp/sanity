module.exports = function(app){
  var sanity = require('./sanity');
  app.get('/api/preview', function () {
    sanity.queueJob({'filename':'preview.png','res':75}, function(file) {
      sanity.scanCompleted(file,'preview');
    });
  });

  app.get('/api/scanimage', function (req, res) {
    var filename = req.param('filename');
    sanity.queueJob({'filename':filename,res:300},function(file) {
      sanity.scanCompleted(file,'scan');
    });
    res.send('Queued: ' + filename);
  });

  app.get('/api/completed', function (req, res) {
    var name = req.param('name');
    if(name === null || typeof(name) === "undefined") {
      res.send(sanity.getCompletedImages());
    }
    else {
      res.download(sanity.translateFile(sanity.getCompletedImage(name).filename));
    }
  });

  app.get('/api/remove', function(req,res) {
    var name = req.param('name');
    var filename = sanity.removeCompletedImage({name: name});
    res.send('Removed item '+ filename);
  });


};
