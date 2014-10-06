describe('Sanity server', function () {
  'use strict';

  var chai = require('chai');
  chai.config.includeStack = true
  chai.should();

  var server = require('../server.js');

  it('should broadcast updates on scan completion', function () {
    true.should.equal(false, "Not implemented");
  });

});
