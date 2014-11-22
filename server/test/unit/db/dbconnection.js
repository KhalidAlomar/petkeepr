"use strict";

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var DbConnection = require('../../../lib/db/dbconnection');

describe('DbConnection', function() {

	describe('#setMaxQueryAttempts', function() {

		var mockConnectionPool;
		var dbConnection;

		beforeEach(function() {
			mockConnectionPool = {};
			dbConnection = new DbConnection(mockConnectionPool);
		});

		it('should update value', function() {
			dbConnection.setMaxQueryAttempts(2);
			expect(dbConnection.getMaxQueryAttempts()).to.equal(2);
			dbConnection.setMaxQueryAttempts(5);
			expect(dbConnection.getMaxQueryAttempts()).to.equal(5);
		});

		it('should throw error if invalid value', function() {
			expect(function() {
				dbConnection.setMaxQueryAttempts(0);
			}).to.throw(Error);
		});
	});

	describe('#query', function() {

		var mockQuery;
		var mockGenericError;
		var mockConnectionLostError;
		var mockPooledConnection;
		var mockConnectionPool;
		var dbConnection;
		var errorHandler;
		var queryCompleteHandler;
		var mockQueryResults;

		var MAX_QUERY_ATTEMPTS = 5;

		beforeEach(function() {
			mockQuery = "query";
			mockGenericError = new Error();
			mockConnectionLostError = { code: 'PROTOCOL_CONNECTION_LOST' };
			mockQueryResults = { a: "Foo" };

			mockPooledConnection = { 
				query: sinon.stub().yields(null, mockQueryResults),
				release: sinon.spy()
			};

			mockConnectionPool = { 
				getConnection: sinon.stub().yields(null, mockPooledConnection) 
			};

			dbConnection = new DbConnection(mockConnectionPool);
			dbConnection.setMaxQueryAttempts(MAX_QUERY_ATTEMPTS);

			errorHandler = sinon.spy();
			dbConnection.on('error', errorHandler);

			queryCompleteHandler = sinon.spy();
			dbConnection.on('queryComplete', queryCompleteHandler);
		});

		it('should raise error event if another query is already in progress', function() {
			mockConnectionPool.getConnection = function() {};
			errorHandler = sinon.spy(function(error) {
				expect(error).to.have.property('name', DbConnection.ErrorNames.QueryInProgress)
			});
			dbConnection.on('error', errorHandler);

			dbConnection.query("query1");
			dbConnection.query("query2");

			expect(errorHandler).to.be.calledOnce;
			expect(queryCompleteHandler).to.not.be.called;
		});

		it('should raise error event if unable to aquire pooled connection', function() {
			mockConnectionPool.getConnection = sinon.stub().yields(mockGenericError, null);

			errorHandler = sinon.spy(function(error) {
				expect(error).to.have.property('name').that.equals(DbConnection.ErrorNames.UnableToGetPooledConnection)
				expect(error).to.have.property('wrappedError').that.equals(mockGenericError);
			});
			dbConnection.on('error', errorHandler);

			dbConnection.query("query");

			expect(errorHandler).to.be.calledOnce;
			expect(queryCompleteHandler).to.not.be.called;
		});

		it('should delegate query to pooled connection', function() {
			dbConnection.query(mockQuery);
			expect(mockPooledConnection.query).to.be.calledWith(mockQuery);
		});

		it('should emit query results if query successful', function() {
			dbConnection.query(mockQuery);
			expect(queryCompleteHandler).to.be.calledOnce;
			expect(queryCompleteHandler).to.be.calledWith(mockQueryResults);
			expect(errorHandler).to.not.be.called;
		});

		it('should emit error if pooled connection query emits error other than PROTOCOL_CONNECTION_LOST', function() {
			mockPooledConnection.query = sinon.stub().yields(mockGenericError, null);

			var errorHandler = sinon.spy(function(error) {
				expect(error).to.have.property('name', DbConnection.ErrorNames.QueryError)
				expect(error).to.have.property('wrappedError').that.equals(mockGenericError);
			});
			dbConnection.on('error', errorHandler);

			dbConnection.query("query");
			
			expect(errorHandler).to.be.calledOnce;
			expect(queryCompleteHandler).to.not.be.called;
		});

		it('should retry query on pooled connection if query emits PROTOCOL_CONNECTION_LOST', function() {
			mockPooledConnection.query = sinon.stub();
			mockPooledConnection.query.onCall(0).yields(mockConnectionLostError, null);
			mockPooledConnection.query.onCall(1).yields(null, mockQueryResults);

			dbConnection.query("query");
			
			expect(queryCompleteHandler).to.be.calledOnce;
			expect(errorHandler).to.not.be.called;
			expect(mockPooledConnection.query.callCount).to.equal(2);
		});

		it('should retry query on pooled connection a limited number of times, then emit error', function() {
			mockPooledConnection.query = sinon.stub().yields(mockConnectionLostError, null);

			var errorHandler = sinon.spy(function(error) {
				expect(error).to.have.property('name', DbConnection.ErrorNames.QueryError)
				expect(error).to.have.property('wrappedError').that.equals(mockConnectionLostError);
			});
			dbConnection.on('error', errorHandler);

			dbConnection.query("query");
			
			expect(mockPooledConnection.query.callCount).to.equal(MAX_QUERY_ATTEMPTS);
			expect(errorHandler).to.be.calledOnce;
			expect(queryCompleteHandler).to.not.be.called;
		});

		it('should release pooled connection after successful query', function() {
			dbConnection.query("query");
			expect(mockPooledConnection.release).to.be.calledAfter(mockPooledConnection.query);
		});

		it('should release pooled connection after every pooled connection query retry', function() {
			mockPooledConnection.query = sinon.stub().yields(mockConnectionLostError, null);
			dbConnection.query("query");
			expect(mockPooledConnection.query.callCount).to.equal(MAX_QUERY_ATTEMPTS);
			expect(mockPooledConnection.release.callCount).to.equal(MAX_QUERY_ATTEMPTS);
		});

		it('should successfully execute multiple queries', function() {
			var mockQuery1 = "query1";
			var mockQuery2 = "query2";
			var mockQueryResults1 = {};
			var mockQueryResults2 = {};

			mockPooledConnection.queryStub = sinon.stub();
			mockPooledConnection.queryStub.onCall(0).yields(null, mockQueryResults1);
			mockPooledConnection.queryStub.onCall(1).yields(null, mockQueryResults2);

			dbConnection.query(mockQuery1);
			dbConnection.query(mockQuery2);
			
			expect(queryCompleteHandler).to.be.calledTwice;
			expect(errorHandler).to.not.be.called;
			expect(queryCompleteHandler.getCall(0).calledWith(mockQueryResults2));
			expect(queryCompleteHandler.getCall(1).calledWith(mockQueryResults1));
		});

		it('should successfully execute new valid query even if previous one failed', function() {
			var mockQueryResults = {};

			mockPooledConnection.query = sinon.stub();
			mockPooledConnection.query.onCall(0).yields(mockGenericError, null);
			mockPooledConnection.query.onCall(1).yields(null, mockQueryResults);

			dbConnection.query("query1");
			dbConnection.query("query2");
			
			expect(queryCompleteHandler).to.be.calledAfter(errorHandler);
		});
	});
});