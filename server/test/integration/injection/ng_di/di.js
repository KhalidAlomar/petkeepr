"use strict";

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var di = require('ng-di');

describe('ng-di', function() {

	describe('di', function() {

		describe('#module', function() {

			describe('called with 2 args', function() {
				
				it('should create a module', function() {
					var modName = 'moduleCreationTest';
					function func() { return di.module(modName); }
					expect(func).to.throw(Error);
					var modTest = di.module(modName, []);
					expect(di.module(modName)).to.equal(modTest);
				});

				it('should replace any existing module with the same name', function() {
					var modName = 'moduleReplaceTest';
					var modTest1 = di.module(modName, []);
					var modTest2 = di.module(modName, []);
					expect(modTest1).to.not.equal(modTest2);
					expect(di.module(modName)).to.equal(modTest2);
				});

				it('should throw if module dependency not found', function() {
					var module = di.module('dependantOnNonExisting', ['nonExistingModule']);
					function func() { return di.injector(['dependantOnNonExisting']); }
					expect(func).to.throw(Error);
				});
				
				it('should support listing a module as a dependency before it has been registered', function() {
					var module = di.module('dependantModule', ['dependedUponModule']);
					var module = di.module('dependedUponModule', []);
					var injector = di.injector(['dependantModule']);
				});
			});

			describe('called with 1 arg', function() {
				
				it('should retrieve an existing module', function() {
					var modName = 'moduleRetrievalTest';
					var modTest = di.module(modName, []);
					expect(di.module(modName)).to.equal(modTest);
				});

				it('should throw if module does not exist', function() {
					var modName = 'moduleDoesNotExistTest';
					function func() { return di.module(modName); }
					expect(func).to.throw(Error);
				});

			});
		});	
	});
});