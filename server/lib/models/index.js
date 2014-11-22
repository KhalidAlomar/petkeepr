"use strict";

var di = require('ng-di');

require('../db');
var angularModule = di.module('modModels', ['modDb']);
module.exports = angularModule;

var Sequelize = require('sequelize');
angularModule.factory('sequelize', ['dbConnectionConfig', function(dbConnectionConfig) {
	return new Sequelize(
		dbConnectionConfig.database, 
		dbConnectionConfig.username, 
		dbConnectionConfig.password,
		dbConnectionConfig);
}]);
angularModule.value('Sequelize', Sequelize);

var createModels = require('./createModels');
createModels.$inject = ['sequelize', 'Sequelize'];
angularModule.factory('models', createModels);

angularModule.factory('budgetModel', ['models', function(models) { return models['Budget']; }]);
angularModule.factory('petModel', ['models', function(models) { return models['Pet']; }]);
