describe('Sanity library', function () {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var proxyquire = require('proxyquire');
  chai.should();


  it('should broadcast updates on scan completion', function () {
    this.timeout(6000); // TODO: figure out how to stop the server starting - maybe proxyquire express and nix it's listen function.
    var broadcast = function(){};
    var app = require('../server');
    var stub = sinon.stub(app.io, "broadcast" , broadcast);
    var filename = "test file";
    var completed = {};
    completed[filename] = {"filename":filename};

    var sanity = require('../server/sanity');

    sanity.scanCompleted(filename,'scan');

    stub.calledWith('updated',{scans: completed}).should.equal(true, "io.broadcast was not called appropriately");

    stub.restore();
  });

  it('should queue a new job when requested', function () {
    var queue = { push: sinon.spy() };
    var asyncStub = {queue: function(){return queue;}};
    var job = "new job";

    var sanity = proxyquire('../server/sanity', {
      "async": asyncStub
    });

    sanity.queueJob(job);

    queue.push.called.should.equal(true, "job was not pushed to queue");

  });
  
  it('should maintain an object map of completed images', function () {

    var sanity = require('../server/sanity');

    var images = sanity.getCompletedImages();

    images.should.be.a('object', "expected list was not returned");

  });
  
  
  it('should return a specific completed image', function () {

    var sanity = require('../server/sanity');
    var completedImage = "testImage"
    
    var getterStub = sinon.stub(sanity, 'getCompletedImages').returns({"testImage":completedImage});

    var image = sanity.getCompletedImage(completedImage);

    image.should.equal(completedImage, "expected list was not returned");

  });

});
