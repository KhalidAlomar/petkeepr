"use strict";

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var DbConnection = require('../../../lib/db/dbconnection');
var DbConnectionProvider = require('../../../lib/db/dbconnectionprovider');

describe('DbConnectionProvider', function() {

	describe('#createConnection', function() {

		it('should return an instance of DbConnection', function() {
			var mockConnectionPool = {};
			var dbConnectionProvider = new DbConnectionProvider(mockConnectionPool);
			var dbConnection = dbConnectionProvider.createConnection();
			expect(dbConnection).to.be.an.instanceOf(DbConnection);
		});

		it('should create a new DbConnection instance each time it is called', function() {
			var mockConnectionPool = {};
			var dbConnectionProvider = new DbConnectionProvider(mockConnectionPool);
			var dbConnection1 = dbConnectionProvider.createConnection();
			var dbConnection2 = dbConnectionProvider.createConnection();
			expect(dbConnection1).to.not.equal(dbConnection2);
		});
	});
});