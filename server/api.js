module.exports = function(app){

  app.get('/api/preview', function () {
    app.sanityLib.queueJob({'filename':'preview.png','res':75}, function(file) {
      app.sanityLib.scanCompleted(file,'preview');
    });
  });

  app.get('/api/scanimage', function (req, res) {
    var filename = req.param('filename');
    app.sanityLib.queueJob({'filename':filename,res:300},function(file) {
      app.sanityLib.scanCompleted(file,'scan');
    });
    res.send('Queued: ' + filename);
  });

  app.get('/api/completed', function (req, res) {
    var id = req.param('id');
    if(id === null || typeof(id) === "undefined") {
      res.send(app.sanityLib.getCompletedImages());
    }
    else {
      res.download(app.sanityLib.translateFile(app.sanityLib.getCompletedImage(id)));
    }
  });

  app.get('/api/remove', function(req,res) {
    var id = req.param('id');
    var filename = app.sanityLib.removeCompletedImage(id);
    res.send('Removed item '+ filename);
  });


};
