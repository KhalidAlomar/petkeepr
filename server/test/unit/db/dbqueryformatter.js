"use strict";

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var mysql = require('mysql');
var DbQueryFormatter = require('../../../lib/db/dbqueryformatter');

describe('DbQueryFormatter', function() {

	describe('#formatQuery', function() {

		it('should delegate to dbApi', function() {
			var mockResult = {};
			var mockDbApi = {  format: sinon.stub().returns(mockResult) };
			var queryFormatter = new DbQueryFormatter(mockDbApi);			
			
			var selectString = {}, params = {};
			var result = queryFormatter.formatQuery(selectString, params);

			expect(result).to.equal(mockResult);
			expect(mockDbApi.format).to.be.calledWith(sinon.match.same(selectString), sinon.match.same(params));
		});

	});
});