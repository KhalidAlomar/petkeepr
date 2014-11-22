"use strict";

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

var di = require('ng-di');


describe('ng-di', function() {

	describe('module', function() {

		var moduleNameOrdinal = 0;
		var moduleName;

		beforeEach(function() {
			moduleName = 'moduleTest' + (moduleNameOrdinal++).toString();
		});

		describe('#value', function() {

			it('should register a value service', function() {
				var module = di.module(moduleName, []);
				module.value('testValue', 123);
				var injector = di.injector([moduleName]);
				expect(injector.get('testValue')).to.equal(123);
			});
		});

		describe('#constant', function() {

			it('should register a constant service', function() {
				var module = di.module(moduleName, []);
				module.constant('testConstant', 123);
				var injector = di.injector([moduleName]);
				expect(injector.get('testConstant')).to.equal(123);
			});
		});

		describe('#service', function() {

			it('should register a "service" service', function() {
				var module = di.module(moduleName, []);
				var serviceFunc = function() { this.x = 123; }
				module.service('testService', serviceFunc);
				var injector = di.injector([moduleName]);
				var serviceInstance = injector.get('testService');
				expect(serviceInstance).to.deep.equal({ x: 123 });
			});

			it('should only construct the service instance on the first injection', function() {
				var module = di.module(moduleName, []);
				var serviceFunc = function() { this.x = 123; }
				module.service('testService', serviceFunc);
				var injector = di.injector([moduleName]);
				var serviceInstance1 = injector.get('testService');
				var serviceInstance2 = injector.get('testService');
				expect(serviceInstance1).to.equal(serviceInstance2);
			});

			it('should inject dependencies of the service', function() {
				var module = di.module(moduleName, []);
				var serviceFunc = function(dependency) { this.dependency = dependency; }
				module.value('a', 123);
				module.service('testService', ['a', serviceFunc]);
				var injector = di.injector([moduleName]);
				var serviceInstance = injector.get('testService');
				expect(serviceInstance).to.deep.equal({ dependency: 123 });
			});
		});

		describe('#factory', function() {

			it('should register a service factory', function() {
				var module = di.module(moduleName, []);
				var factoryFunc = function() { return  123; }
				module.factory('testFactory', factoryFunc);
				var injector = di.injector([moduleName]);
				expect(injector.get('testFactory')).to.equal(123);
			});

			it('should only invoke the factory function on the first injection', function() {
				var module = di.module(moduleName, []);
				var callCount = 0;
				var factoryFunc = function() { callCount++; return callCount; }
				module.factory('testFactory', factoryFunc);
				var injector = di.injector([moduleName]);
				var value1 = injector.get('testFactory');
				var value2 = injector.get('testFactory');
				expect(value1).to.equal(value2).to.equal(1);
			});

			it('should inject dependencies of the factory function', function() {
				var module = di.module(moduleName, []);
				var factoryFunc = function(dependency) { return dependency; }
				module.value('a', 123);
				module.factory('testFactory', ['a', factoryFunc]);
				var injector = di.injector([moduleName]);
				var value = injector.get('testFactory');
				expect(value).to.equal(123);
			});
		});

		describe('#provider', function () {

			it('should register a service provider', function() {
				function TestProvider() { }
				TestProvider.prototype.$get = function() { return 123; }
				var module = di.module(moduleName, []);
				module.provider('test', TestProvider);
				var injector = di.injector([moduleName]);
				expect(injector.get('test')).to.equal(123);
			});

			it('should only invoke the $get function on the first injection', function() {
				function TestProvider() { this.x = 0; }
				TestProvider.prototype.$get = function() { 
					this.x = this.x + 1;
					return this.x; 
				};
				var module = di.module(moduleName, []);
				module.provider('test', TestProvider);
				var injector = di.injector([moduleName]);
				var value1 = injector.get('test');
				var value2 = injector.get('test');
				expect(value1).to.equal(value2).to.equal(1);
			});

			it('should inject dependencies of the $get function', function() {
				function TestProvider() { }
				TestProvider.prototype.$get = ['a', function(dependency) { return dependency; } ];
				var module = di.module(moduleName, []);
				module.value('a', 123)
				module.provider('test', TestProvider);
				var injector = di.injector([moduleName]);
				var value = injector.get('test');
				expect(value).to.equal(123);
			});
		});

		describe('#config', function() {

			it('should inject constants and providers', function(done) {
				var module = di.module(moduleName, []);
				module.constant('testConstant', 123);
				function TestProvider() { }
				TestProvider.prototype.$get = function() { return 456; };
				module.provider('test', TestProvider);
				module.config(['testConstant', 'testProvider', function(a, b) {
					expect(a).to.equal(123);
					expect(b.$get()).to.equal(456);
					done();
				}]);
				var injector = di.injector([moduleName]);
			});

			it('should not inject value services', function() {
				var module = di.module(moduleName, []);
				module.value('testValue', 123);
				module.config(['testValue', function(a) { }]);
				expect(function() { di.injector([moduleName]); }).to.throw(Error);
			});

			it('should not inject factory services', function() {
				var module = di.module(moduleName, []);
				module.factory('testFactory', function() { return 456; });
				module.config(['testFactory', function(a) {}]);
				expect(function() { di.injector([moduleName]); }).to.throw(Error);
			});

			it('should not inject "service" services', function() {
				var module = di.module(moduleName, []);
				module.service('testService', function() {});
				module.config(['testService', function(a) {}]);
				expect(function() { di.injector([moduleName]); }).to.throw(Error);
			});

			it('should not inject provider values', function() {
				var module = di.module(moduleName, []);
				function TestProvider() { }
				TestProvider.prototype.$get = function() { return 1; };
				module.provider('test', TestProvider);
				module.config(['test', function(a) {}]);
				expect(function() { di.injector([moduleName]); }).to.throw(Error);
			});

			it('should be invoked before run block', function() {
				var module = di.module(moduleName, []);
				var configSpy = sinon.spy();
				var configFunc = function() { configSpy(); }
				var runSpy = sinon.spy();
				var runFunc = function() { runSpy(); }
				module.config(configFunc);
				module.run(runFunc);
				di.injector([moduleName]);
				expect(configSpy).to.have.been.calledBefore(runSpy);
			});
		});

		describe('#run', function() {

			it('should be run as injector is created', function() {
				var module = di.module(moduleName, []);
				var runSpy = sinon.spy();
				var runFunc = function() { runSpy(); }
				module.run(runFunc);
				var injector = di.injector([moduleName]);
				expect(runSpy).to.have.been.calledOnce;
			});

			it('should inject constants, values, factory values, provider values and service instances', function(done) {
				var module = di.module(moduleName, []);
				module.constant('testConstant', 1);
				module.value('testValue', 2);
				module.factory('testFactory', function() { return 3; });
				module.service('testService', function() { this.x = 4; });
				function TestProvider() { }
				TestProvider.prototype.$get = function() { return 5; };
				module.provider('test', TestProvider);
				module.run(['testConstant', 'testValue', 'testFactory', 'testService', 'test', function(a, b, c, d, e) {
					expect(a).to.equal(1);
					expect(b).to.equal(2);
					expect(c).to.equal(3);
					expect(d).to.deep.equal({ x: 4 });
					expect(e).to.equal(5);
					done();
				}]);
				var injector = di.injector([moduleName]);
			});

			it('should not inject providers', function() {
				var module = di.module(moduleName, []);
				function TestProvider() { }
				TestProvider.prototype.$get = function() { return 1; };
				module.provider('test', TestProvider);
				module.run(['testProvider', function(a) { }]);
				expect(function() { di.injector([moduleName]); }).to.throw(Error);
			});
		});

	});
});