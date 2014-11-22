"use strict";

var di = require('ng-di');
var mysql = require('mysql');
var DbQueryFormatter = require('./dbqueryformatter');
var DbConnectionPoolProvider = require('./dbconnectionpoolprovider');
var DbConnectionProvider = require('./dbconnectionprovider');
var DbConnection = require('./dbconnection');

var angularModule = di.module('modDb', []);
module.exports = angularModule;

angularModule.value('dbApi', mysql);

angularModule.service('dbQueryFormatter', ['dbApi', DbQueryFormatter]);

var env = process.env.NODE_ENV || "development";
var dbConnectionConfig = require('./config')[env];
angularModule.value('dbConnectionConfig', dbConnectionConfig);

DbConnectionPoolProvider.prototype.$get = ['dbConnectionConfig',  DbConnectionPoolProvider.prototype.createConnectionPool];
angularModule.provider('dbConnectionPool', DbConnectionPoolProvider);
angularModule.config(['dbConnectionPoolProvider', function(dbConnectionPoolProvider) {
	dbConnectionPoolProvider.setDbApi(mysql);
}]);

angularModule.service('dbConnectionProvider', ['dbConnectionPool', DbConnectionProvider]);
