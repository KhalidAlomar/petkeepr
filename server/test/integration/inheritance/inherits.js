"use strict";

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var inherits = require('inherits');

describe('inherits', function() {

	var BaseCtor, SubCtor;
	beforeEach(function() {
		BaseCtor = function() { };
		SubCtor = function() { };
	});

	it('should assign a super_ property on the subclass Ctor function', function() {
		expect(SubCtor).to.not.have.property('super_');
		inherits(SubCtor, BaseCtor);
		expect(SubCtor).to.have.property('super_').that.equals(BaseCtor);
	});

	it('should assign a prototype to subclass ctor based on the base class', function() {
		BaseCtor.prototype.x = 1;
		inherits(SubCtor, BaseCtor);
		expect(SubCtor.prototype).to.have.property('x');
	});

	it('should preserve the constructor property on the subclass prototype', function() {
		inherits(SubCtor, BaseCtor);
		expect(SubCtor.prototype.constructor).to.equal(SubCtor);
	});
});