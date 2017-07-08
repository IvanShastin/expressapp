var fortune = require('../lib/fortune');

var expect = require('chai').expect;

suite('fortune coockie tests', function() {
    test('getFortune() should return a fortune', function() {
        expect(typeof fortune.getFortune() === 'string');
    });
});