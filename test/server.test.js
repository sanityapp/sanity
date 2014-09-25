describe('Sanity server', function () {
  'use strict';

  var chai = require('chai');
  chai.config.includeStack('true')
  chai.should();

  var server = require('../server.js');

  it('works', function () {
    true.should.equal(true);
  });

  it('still works', function () {
    false.should.not.equal(true);
  });

});
