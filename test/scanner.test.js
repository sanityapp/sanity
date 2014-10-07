describe('Sanity scanner interface', function () {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var proxyquire = require('proxyquire');
  chai.should();

  it('should call the scanimage binary with appropriate parameters', function () {

    var exec = sinon.spy();   // TODO: need to make sure this includes "on" - make it the real library with one method stubbed
    var callback = sinon.spy();
    var filename = "test file";
    var res = 90;
    var job = {"filename": filename, "res": res};
    var childProcessStub = { exec: exec };
    var completed = {"filename":filename};

    var scanner = proxyquire('../server/scanner', {
      "child_process": childProcessStub
    });

    scanner.scanImage(job,callback);

    exec.calledWithMatch(new RegExp("scanimage.+--resolution "+ res +".+" + filename)).should.equal(true, "scanimge not called with correct parameters");
    callback.called.should.equal(true, "callback was not invoked");
  });

});
