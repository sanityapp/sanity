describe('Sanity library', function () {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var proxyquire = require('proxyquire');
  chai.should();

  var sanity = require('../server/sanity');

  it('should broadcast updates on scan completion', function () {
    var broadcast = function(){};
    var app = require('../server');
    var stub = sinon.stub(app.io, "broadcast",broadcast);
    var filename = "test file";
    var completed = {"filename":filename};

    var sanity = require('../server/sanity');

    sanity.scanCompleted(filename,'scan');

    stub.calledWith('updated',{scans: [completed]}).should.equal(true, "io.broadcast was not called");

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

});
