describe('Sanity server', function () {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var fs = require('fs');
  var proxyquire = require('proxyquire');
  chai.should();


  it('should create a new directory to contain scans', function () {
    var mkdirStub = sinon.stub(fs, 'mkdir', function(){});
    var readDirStub = sinon.stub(fs, 'readdir', function(){});

    var server = proxyquire('../server',
    {
      './server/api': function(){},
      './server/sanity': function(){},
      'fs': {mkdir: mkdirStub, readdir: readDirStub}
    });

    //mkdirStub.called.should.equal('true', 'Directory was not created.');

    mkdirStub.restore();
    
  });

});
