"use strict";

var chai = require("chai");
var expect = chai.expect;
var assert = require('assert');
var sinon = require("sinon");

chai.use(require("sinon-chai"));
chai.use(require('chai-shallow-deep-equal'));

var mysql = require('mysql');

describe('node-mysql', function() {

	describe('PooledConnection', function() {

		var connectionConfig, connectionPool, testConnection;

		before(function(done) {
			connectionConfig = {
			  	host: 'localhost',
			  	user: 'root',
			  	password: 'mysqlrootpass2',
			  	database: 'finances_test',
			};
			connectionPool = mysql.createPool(connectionConfig);
			connectionPool.getConnection(function(err, connection) {
				testConnection = connection;
				done();
			});
		});

		after(function(done) {
			testConnection.release();
			connectionPool.end(done);
		});

		describe('#beginTransaction', function() {

			var query, insert;

			before(function() {
				query = 'SELECT * from `testtransaction`';
				insert = 'INSERT INTO `testtransaction` (`name`) VALUES ("foo")';
			});

			beforeEach(function(done) {
				testConnection.beginTransaction(function (err) {
					expect(err).is.null;
					done();
				});
			});

			it('should discard changes if transaction is rolled back', function(done) {
				testConnection.query(query, function(err, result) {
					expect(err).to.be.null;
					var prevRowCount = result.length;

					testConnection.query(insert, function(err, result) {
						expect(err).to.be.null;
						expect(result.affectedRows).to.equal(1);

						testConnection.query(query, function(err, result) {
							expect(err).to.be.null;
							expect(result.length).to.equal(prevRowCount + 1);

					 		testConnection.rollback(function() {
								testConnection.query(query, function(err, result) {
									expect(err).to.be.null;
									expect(result.length).to.equal(prevRowCount);
					 				done();
								});
				 			});
						});
					});
				});
			});

			it('should keep changes if transaction is committed', function(done) {
				testConnection.query(query, function(err, result) {
					expect(err).to.be.null;
					var prevRowCount = result.length;

					testConnection.query(insert, function(err, result) {
						expect(err).to.be.null;
						expect(result.affectedRows).to.equal(1);

						testConnection.query(query, function(err, result) {
							expect(err).to.be.null;
							expect(result.length).to.equal(prevRowCount + 1);

							testConnection.commit(function(err) {
								expect(err).to.be.null;
								testConnection.query(query, function(err, result) {
									expect(err).to.be.null;
									expect(result.length).to.equal(prevRowCount + 1);
									done();
								});
							});
						});
					});
				});
			});

		});

		describe('#query', function() {
		
			var TABLE_NAME, SELECT_ALL_ROWS;

			beforeEach(function(done) {
				testConnection.beginTransaction(function (err) {
					expect(err).is.null;
					testConnection.query('SELECT COUNT(*) AS count FROM testquery', function(err, rows) {
						expect(rows[0].count).equals(0);
						done();
					});
				});

				TABLE_NAME = 'testquery';
				SELECT_ALL_ROWS = mysql.format('SELECT * FROM ??', [TABLE_NAME]);
			});

			afterEach(function(done) {
				testConnection.rollback(done)
			});

			describe('SELECT', function() {

				it('should return results from a valid query', function(done) {
					testConnection.query('SELECT 1 + 1 AS solution', function(err, rows) {
						expect(rows[0].solution).to.equal(2);
						done();
					});
				});

				it('should return results from a valid prepared query', function(done) {
					var query = mysql.format('SELECT * FROM ?? WHERE ?? > ?', [TABLE_NAME, 'id', 1]);
					testConnection.query(query, function(err, rows) {
						expect(rows.length).to.equal(0);
						done();
					});
				});
			});

			describe('INSERT', function() {

				it('should handle a single-row INSERT', function(done) {
					var newData = { name: "foobar", age: 12 };
					var insertStatement = mysql.format('INSERT INTO ?? SET ?', [TABLE_NAME, newData]);
					testConnection.query(insertStatement, function(err, result) {
						expect(err).to.not.exist;

						testConnection.query(SELECT_ALL_ROWS, function(err, rows) {
							expect(rows.length).to.equal(1);
							expect(rows[0]).to.shallowDeepEqual(newData);
							done();
						});
					});
				});

				it('should handle a multi-row INSERT', function(done) {
					var rowValues = [['foo', 12], ['foobar', 24]];
					var insertStatement = mysql.format('INSERT INTO ?? (name, age) VALUES ?', [TABLE_NAME, rowValues]);
					testConnection.query(insertStatement, function(err, result) {
						expect(err).to.not.exist;

						testConnection.query(SELECT_ALL_ROWS, function(err, rows) {
							expect(rows.length).to.equal(2);
							expect(rows[0]).to.shallowDeepEqual({ name: 'foo', age: 12 });
							expect(rows[0]).to.have.property('id').that.is.a('number');
							done();
						});
					});
				});

				it('should error if table not found', function(done) {
					var insertStatement = mysql.format('INSERT INTO ?? SET ?', ['unknown_table', { name: "foobar", age: 12 }]);
					testConnection.query(insertStatement, function(err, result) {
						expect(err).to.have.property('code').that.equals('ER_NO_SUCH_TABLE');
						done();
					});
				});

				it('should error if column not found', function(done) {
					var newData = { unknown_col: "foobar", age: 12 };
					var insertStatement = mysql.format('INSERT INTO ?? SET ?', [TABLE_NAME, newData]);
					testConnection.query(insertStatement, function(err, result) {
						expect(err).to.have.property('code').that.equals('ER_BAD_FIELD_ERROR');
						done();
					});
				});

				it('should error if column data is wrong type', function(done) {
					var newData = { name: "foobar", age: "hello" };
					var insertStatement = mysql.format('INSERT INTO ?? SET ?', [TABLE_NAME, newData]);
					testConnection.query(insertStatement, function(err, result) {
						expect(err).to.have.property('code').that.equals('ER_TRUNCATED_WRONG_VALUE_FOR_FIELD');
						done();
					});
				});
			});

			describe('DELETE', function() {

				it('should handle a DELETE', function(done) {
					var newData = { name: "foobar", age: 12 };
					var insertStatement = mysql.format('INSERT INTO ?? SET ?', [TABLE_NAME, newData]);
					testConnection.query(insertStatement, function(err, result) {
						var id = result.insertId;
						var deleteStatement = mysql.format('DELETE FROM ?? WHERE id = ?', [TABLE_NAME, id]);
						testConnection.query(deleteStatement, function(err, result) {
							expect(result.affectedRows).to.equal(1);
							done();
						});
					});
				});

				it('should handle a DELETE where no records match criteria', function(done) {
					var id = 99;
					var deleteStatement = mysql.format('DELETE FROM ?? WHERE id = ?', [TABLE_NAME, id]);
					testConnection.query(deleteStatement, function(err, result) {
						expect(result.affectedRows).to.equal(0);
						done();
					});
				});
			});

			describe('UPDATE', function() {

				it('should handle a single-row UPDATE', function(done) {
					var newData = { name: "foo", age: 12 };
					var insertStatement = mysql.format('INSERT INTO ?? SET ?', [TABLE_NAME, newData]);
					testConnection.query(insertStatement, function(err, result) {
						var id = result.insertId;
						var updatedData = { name: "foobar", age: 13 };
						var updateStatement = mysql.format('UPDATE ?? SET ? WHERE ?? = ?', [TABLE_NAME, updatedData, 'id', id]);
						testConnection.query(updateStatement, function(err, result) {
							expect(result.affectedRows).to.equal(1);

							var selectStatement = mysql.format('SELECT * FROM ?? WHERE ?? = ?', [TABLE_NAME, 'id', id]);
							testConnection.query(selectStatement, function(err, rows) {
								expect(rows[0]).to.shallowDeepEqual(updatedData);
								done();
							});
						});
					});
				});

				it('should successfully perform a multi-row UPDATE', function(done) {
					var rowValues = [['foo', 12], ['foobar', 24]];
					var insertStatement = mysql.format('INSERT INTO ?? (name, age) VALUES ?', [TABLE_NAME, rowValues]);
					testConnection.query(insertStatement, function(err, result) {
						expect(result.affectedRows).to.equal(2);

						testConnection.query(SELECT_ALL_ROWS, function(err, rows) {
							expect(rows.length).to.equal(2);
							
							var updateSql = 'UPDATE ' + TABLE_NAME + ' ' +
											'SET name = CASE ' +
											'WHEN id = ? THEN ? ' +
											'WHEN id = ? THEN ? ' +
											'END ' +
											'WHERE id in (?)';
							var updateStatement = mysql.format(updateSql, [rows[0].id, 'bob', rows[1].id, 'ted', [rows[0].id, rows[1].id]]);
							testConnection.query(updateStatement, function(err, result) {
								expect(result.affectedRows).to.equal(2);
								
								testConnection.query(SELECT_ALL_ROWS, function(err, rows) {
									expect(rows.length).to.equal(2);
									expect(rows[0].name).to.equal('bob');
									expect(rows[1].name).to.equal('ted');
									done();
								});
							});
						});
					});
				});
			});
		});
	});

});