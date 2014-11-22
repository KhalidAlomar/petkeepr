"use strict";

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var mysql = require('mysql');
var DbConnectionPoolProvider = require('../../../lib/db/dbconnectionpoolprovider');

describe('DbConnectionPoolProvider', function() {

	describe('#createConnectionPool', function() {
		var dbConnectionConfig, apiConnectionConfig, connectionPoolProvider;
		var mockDbApi, mockConnectionPool;

		before(function() {
			dbConnectionConfig = {
				poolSize: 3,
			  	hostName: 'localhost',
			  	user: 'root',
			  	passwd: 'mysqlrootpass2',
			  	database: 'finances_test'
			};
			apiConnectionConfig = {
				connectionLimit: 3,
			  	host: 'localhost',
			  	user: 'root',
			  	password: 'mysqlrootpass2',
			  	database: 'finances_test'
			};

			mockConnectionPool = {};
			mockDbApi = { createPool: sinon.stub().returns(mockConnectionPool) };
			connectionPoolProvider = new DbConnectionPoolProvider();
			connectionPoolProvider.setDbApi(mockDbApi);

		});
		
		it('should delegate pool creation to dbApi', function() {
			var connectionPool = connectionPoolProvider.createConnectionPool(dbConnectionConfig);
			expect(connectionPool).to.equal(mockConnectionPool);
			expect(mockDbApi.createPool).to.be.calledOnce;
			expect(mockDbApi.createPool).to.be.calledWith(sinon.match(apiConnectionConfig));
		});

	});
});