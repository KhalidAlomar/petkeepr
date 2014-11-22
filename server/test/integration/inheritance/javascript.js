"use strict";

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

describe('javascript', function() {

	describe('function', function() {

		it('should have a default prototype with a properly initialized constructor property', function() {
			var func = function() {};
			expect(func).to.have.property('prototype').that.exists;
			expect(func.prototype.constructor).to.equal(func);
		});
	});

	describe('object', function() {

		it('should have a __proto__ property that is set to the prototype of the ctor function', function() {
			var Ctor = function() { };
			var instance = new Ctor();
			expect(instance.__proto__).to.equal(Ctor.prototype);
		});

		it('should lookup properties in prototype if not found in itself', function() {
			var Ctor = function() { };
			var instance = new Ctor();
			expect(instance).to.not.have.property('x');
			Ctor.prototype.x = 1;
			expect(instance).to.have.property('x');
		});

		it('should override __proto__ properties with own properties', function() {
			var Ctor = function() { this.x = 2; };
			Ctor.prototype.x = 1;
			var instance = new Ctor();
			expect(instance.x).to.equal(2);
		});

		it('should chain prototypes when looking up properties', function() {
			var Ctor1 = function() { };
			Ctor1.prototype.x = 1;
			var Ctor2 = function() { };
			Ctor2.prototype = new Ctor1();
			var ctor2Instance = new Ctor2();
			expect(ctor2Instance.x).to.equal(1);
		});
	});
});