"use strict";

var DbConnection = require('./dbconnection');

module.exports = DbConnectionProvider;

function DbConnectionProvider(connectionPool) {
  this._connectionPool = connectionPool;
};

DbConnectionProvider.prototype.createConnection = function() { 
  return new DbConnection(this._connectionPool);
};
