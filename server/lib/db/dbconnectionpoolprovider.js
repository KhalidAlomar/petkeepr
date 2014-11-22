"use strict";

module.exports = DbConnectionPoolProvider;

function DbConnectionPoolProvider() {
  this._dbApi = null;
};

DbConnectionPoolProvider.prototype.setDbApi = function(value) {
	this._dbApi = value;
};

DbConnectionPoolProvider.prototype.createConnectionPool = function(connectionConfig) { 
  return this._dbApi.createPool({
    connectionLimit: connectionConfig.pool.maxConnections,
    host: connectionConfig.host,
    user: connectionConfig.username,
    password: connectionConfig.password,
    database: connectionConfig.database
  });
};


