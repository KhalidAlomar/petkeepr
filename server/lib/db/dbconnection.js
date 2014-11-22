"use strict";

var events = require('events');
var inherits = require('inherits');
var ErrorEx = require('../util/errorex');

module.exports = DbConnection;

inherits(DbConnection, events.EventEmitter);
function DbConnection(connectionPool) {
  events.EventEmitter.call(this);

  this._connectionPool = connectionPool;
  this._connection = null;
  this._pendingQuery = null;
  this._attempts = 0;
  this._maxQueryAttempts = DbConnection._DEFAULT_MAX_QUERY_ATTEMPTS;
}

DbConnection.prototype.setMaxQueryAttempts = function(value) {
  if (value <= 0) {
    throw new Error('Invalid value for MaxQueryAttempts, must be >= 1');
  }
  this._maxQueryAttempts = value;
};

DbConnection.prototype.getMaxQueryAttempts = function() {
  return this._maxQueryAttempts;
}

DbConnection.prototype.query = function(queryString) {
  if (this._pendingQuery) {
    this.emit('error', this._createQueryInProgressError());
    return;
  }

  this._pendingQuery = queryString;
  this._attempts = 0;

  this._connect();
};

DbConnection.prototype._connect = function() {
  this._attempts += 1;
  this._connectionPool.getConnection(this._connectionCallback.bind(this));
};

DbConnection.prototype._connectionCallback = function(err, connection) {
  if (err) {
    this._pendingQuery = null;
    this.emit('error', this._createUnableToGetPooledConnectionError(err));
    return;
  }
  this._connection = connection;
  this._doPendingQuery();
};

DbConnection.prototype._doPendingQuery = function() {
  this._connection.query(this._pendingQuery, this._queryCallback.bind(this));
};

DbConnection.prototype._queryCallback = function(err, results) {
  if (err) {
    this._handleQueryError(err);
  } else {
    this._pendingQuery = null;
    this._cleanupConnection();
    this.emit('queryComplete', results)
  }
};

DbConnection.prototype._handleQueryError = function(err) {
    this._cleanupConnection();
    if (err.code === 'PROTOCOL_CONNECTION_LOST' && this._attempts < this._maxQueryAttempts) {
      this._connect();
    } else {
      this._pendingQuery = null;
      this.emit('error', this._createQueryError(err));
    }
}

DbConnection.prototype._cleanupConnection = function() {
  if (this._oonnection === null) return;
  this._connection.release();
  this._connection = null;
}

DbConnection.ErrorNames = {
  QueryInProgress: 'QUERY_IN_PROGRESS',
  UnableToGetPooledConnection: 'UNABLE_TO_GET_POOLED_CONNECTION',
  QueryError: 'QUERY_ERROR'
};

DbConnection._DEFAULT_MAX_QUERY_ATTEMPTS = 5;

DbConnection.prototype._createQueryInProgressError = function() {
  return new ErrorEx('Query already in progress', DbConnection.ErrorNames.QueryInProgress);
};
DbConnection.prototype._createUnableToGetPooledConnectionError = function(err) {
  return new ErrorEx('Unable to get pooled connection', DbConnection.ErrorNames.UnableToGetPooledConnection, err);
};
DbConnection.prototype._createQueryError = function(err) {
  return new ErrorEx('Error executing query', DbConnection.ErrorNames.QueryError, err);
};

