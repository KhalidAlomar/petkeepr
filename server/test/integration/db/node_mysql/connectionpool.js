"use strict";

var chai = require("chai");
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var mysql = require('mysql');

describe('node-mysql', function() {

	var connectionConfig, connectionPool;
	
	describe('ConnectionPool', function() {

		var connectionConfig, connectionPool;

		beforeEach(function() {
			connectionConfig = {
				connectionLimit: 3,
			  	host: 'localhost',
			  	user: 'root',
			  	password: 'mysqlrootpass2',
			  	database: 'finances_test',
			  	waitForConnections: true
			};
		});

		afterEach(function(done) {
			if (connectionPool) {
				connectionPool.end(done);
			} else {
				done();
			}
		});

		describe('#getConnection', function() {

			it('should return connection when provided correct configuration', function(done) {
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.getConnection(function(err, connection) {
					expect(err).to.be.null;
					expect(connection).not.to.be.null;
					connection.release();
					done();
				});
			});

			it('should callback with error if server host not found', function(done) {
				connectionConfig.host = 'blah';
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.getConnection(function(err, connection) {
					expect(err).to.have.property('code').that.equals('ENOTFOUND');
					expect(connection).to.be.undefined;
					done();
				});
			});

			it('should callback with error if no server on endpoint', function(done) {
				connectionConfig.port = 1;
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.getConnection(function(err, connection) {
					expect(err).to.have.property('code').that.equals('ECONNREFUSED');
					expect(connection).to.be.undefined;
					done();
				});
			});

			it('should callback with error if database name not found', function(done) {
				connectionConfig.database = "database_that_doesnt_exist";
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.getConnection(function(err, connection) {
					expect(err).to.have.property('code').that.equals('ER_BAD_DB_ERROR');
					expect(connection).to.be.undefined;
					done();
				});
			});

			it('should callback with error if bad username', function(done) {
				connectionConfig.user = "user_that_doesnt_exist";
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.getConnection(function(err, connection) {
					expect(err).to.have.property('code').that.equals('ER_ACCESS_DENIED_ERROR');
					expect(connection).to.be.undefined;
					done();
				});
			});

			it('should wait for next available connection when limit reached', function(done) {
				connectionConfig.connectionLimit = 1;
				connectionPool = mysql.createPool(connectionConfig);
				var connection1HasBeenReleased = false;
				connectionPool.getConnection(function(err, connection) {
					expect(connection).to.exist;
					expect(err).to.not.exist;
					setTimeout(function() {
						connection1HasBeenReleased = true;
						connection.release();
					}, 200);
				});
				connectionPool.getConnection(function(err, connection) {
					expect(err).to.be.null;
					expect(connection).to.exist;
					expect(connection1HasBeenReleased).to.be.true;
					connection.release();
					done();
				});
			});

			it('should callback with error if connectionPool has already been ended', function(done) {
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.end(function (err) {
					expect(err).to.not.exist;

					connectionPool.getConnection(function(err, connection) {
						expect(connection).to.not.exist;
						expect(err).to.exist;
						// Prevent connectionPool.end() from being called again in cleanup
						connectionPool = null;
						done();
					});
				});

			});

		});

		describe('#end', function() {

			it('should cause subsequent calls to connectionPool.getConnection to error', function(done) {
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.end(function (err) {
					expect(err).to.not.exist;

					connectionPool.getConnection(function(err, connection) {
						expect(connection).to.not.exist;
						expect(err).to.exist;
						// Prevent connectionPool.end() from being called again in cleanup
						connectionPool = null;
						done();
					});
				});

			});

			it('should cause subsequent calls to pooledConnection.query to error', function(done) {
				connectionPool = mysql.createPool(connectionConfig);
				connectionPool.getConnection(function(err, connection) {
					expect(connection).exists;

					connectionPool.end(function(err) {
						expect(err).to.not.exist;
						connectionPool = null;

						connection.query("select 1 + 2 AS solution", function(err) {
							expect(err).to.have.property('code').that.equals('PROTOCOL_ENQUEUE_AFTER_QUIT');
							connection.release();
							done();
						});
					});
				});
			});
		});

	});

});