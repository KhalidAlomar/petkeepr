"use strict";

var di = require('ng-di');
require('../lib/db');
require('../lib/models');

var angularModule = di.module('modRouters', ['modDb', 'modModels']);
module.exports = angularModule;

var createBudgetRouter = require('./budgetrouter');
createBudgetRouter.$inject = ['models'];
angularModule.factory('budgetRouter', createBudgetRouter);

var createPetRouter = require('./petrouter');
createPetRouter.$inject = ['models'];
angularModule.factory('petRouter', createPetRouter);
