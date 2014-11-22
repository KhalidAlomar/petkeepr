"use strict";

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var di = require('ng-di');

describe('ng-di', function() {

	describe('injector', function() {

		var modMain, injector;

		before(function() {
			modMain = di.module('modMain', []);
			modMain.value('a', 1);
			modMain.value('b', 2);
			modMain.value('c', 3);
			injector = di.injector(['modMain']);
		});

		describe('#get', function() {

			it('should retrieve a registered service', function() {
				expect(injector.get('a')).to.equal(1);
			});

		});

		describe('#invoke', function() {

			describe('$inject annotation', function() {

				it('should supply arguments using registered services', function() {
					function testFunc(firstParam) {
						return firstParam;
					}
					testFunc.$inject = ['a'];
					var result = injector.invoke(testFunc);
					expect(result).to.equal(1);
				});			

				it('should supply arguments first from locals, then using registered services', function() {
					function testFunc(firstParam, secondParam, thirdParam) {
						return firstParam.toString() + secondParam.toString() + thirdParam.toString();
					}
					testFunc.$inject = ['a', 'b', 'd'];
					var locals = { b: 4, d: 9 };
					var result = injector.invoke(testFunc, null, locals);
					expect(result).to.equal('149');
				});			

				it('should throw if argument cannot be resolved', function() {
					function testFunc(firstParam) {
						return firstParam;
					}
					testFunc.$inject = ['notfound'];
					expect(function() { injector.invoke(testFunc); }).to.throw(Error);					
				});
			});

			describe('inline annotation', function() {

				it('should supply arguments using registered services', function() {
					function testFunc(firstParam) {
						return firstParam;
					}
					var result = injector.invoke(['a', testFunc]);
					expect(result).to.equal(1);
				});			

				it('should supply arguments first from locals, then using registered services', function() {
					function testFunc(firstParam, secondParam, thirdParam) {
						return firstParam.toString() + secondParam.toString() + thirdParam.toString();
					}
					var localVars = { b: 4, d: 9 };
					var result = injector.invoke(['a', 'b', 'd', testFunc], null, localVars);
					expect(result).to.equal('149');
				});			

				it('should throw if argument cannot be resolved', function() {
					function testFunc(firstParam) {
						return firstParam;
					}
					expect(function() { injector.invoke(['notFound', testFunc]); }).to.throw(Error);					
				});
			});
		});

		describe('#instantiate', function() {

			var TestClass;
			beforeEach(function() {
				TestClass = function(param1, param2, param3) {
					this.a = param1;
					this.b = param2;
					this.c = param3;
				}
			});

			describe('$inject annotation', function() {

				it('should call ctor, supplying arguments using registered services', function() {
					TestClass.$inject = ['a', 'b', 'c'];
					var instance = injector.instantiate(TestClass);
					expect(instance).to.deep.equal({ a: 1, b: 2, c: 3 });
				});			

				it('should call ctor, supplying arguments first from locals, then using registered services', function() {
					TestClass.$inject = ['a', 'b', 'd'];
					var localVars = { b: 4, d: 9 };
					var instance = injector.instantiate(TestClass, localVars);
					expect(instance).to.deep.equal({ a: 1, b: 4, c: 9 });
				});			

				it('should throw if argument cannot be resolved', function() {
					TestClass.$inject = ['a', 'b', 'nonExistant'];
					expect(function() { injector.instantiate(TestClass); }).to.throw(Error);					
				});

				it('should call ctor each time, even if the same type has already been instantiated', function() {
					TestClass.$inject = ['a', 'b', 'c'];
					var instance1 = injector.instantiate(TestClass);
					var instance2 = injector.instantiate(TestClass);
					expect(instance1).to.not.equal(instance2);
				});
			});

			describe('inline annotation', function() {

				it('should call ctor, supplying arguments using registered services', function() {
					var instance = injector.instantiate(['a', 'b', 'c', TestClass]);
					expect(instance).to.deep.equal({ a: 1, b: 2, c: 3 });
				});			

				it('should call ctor, supplying arguments first from locals, then using registered services', function() {
					var localVars = { b: 4, d: 9 };
					var instance = injector.instantiate(['a', 'b', 'd', TestClass], localVars);
					expect(instance).to.deep.equal({ a: 1, b: 4, c: 9 });
				});			

				it('should throw if argument cannot be resolved', function() {
					expect(function() { injector.instantiate(['x', TestClass]); }).to.throw(Error);					
				});

				it('should call ctor each time, even if the same type/args combination has already been instantiated', function() {
					var instance1 = injector.instantiate(['a', 'b', 'c', TestClass]);
					var instance2 = injector.instantiate(['a', 'b', 'c', TestClass]);
					expect(instance1).to.not.equal(instance2);
				});
			});
		});
	});
});