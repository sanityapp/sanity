describe('Sanity scanner interface', function () {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var proxyquire = require('proxyquire');
  var child_process = require('child_process');
  chai.should();

  it('should call the scanimage binary with appropriate parameters', function () {

    var child = child_process.exec('echo "test"');
    var onStub = sinon.stub(child, 'on', function(){})
    var execStub = sinon.stub(child_process, 'exec', function(){ return {on : onStub}});
    var filename = "test file";
    var res = 90;
    var job = {"filename": filename, "res": res};
    var completed = {"filename":filename};

    var scanner = proxyquire('../server/scanner', {
      "child_process": child_process
    });

    scanner.scanImage(job,function(){});

    execStub.calledWithMatch(new RegExp("scanimage.+--resolution "+ res +".+" + filename)).should.equal(true, "scanimge not called with correct parameters");
    onStub.calledWith('exit').should.equal(true, "callback was not invoked");
    
    execStub.reset();
  });

});
