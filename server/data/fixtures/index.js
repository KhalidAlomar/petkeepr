"use strict";

var di = require('ng-di');

require('../../lib/models');
var angularModule = di.module('modFixtures', ['modModels']);
module.exports = angularModule;

var BudgetFixture = require('./budgetfixture');
angularModule.service('budgetFixture', ['budgetModel', BudgetFixture]);

var PetFixture = require('./petfixture');
angularModule.service('petFixture', ['petModel', PetFixture]);

angularModule.factory('fixtures', [
	'budgetFixture',
	'petFixture',
	function (budgetFixture, petFixture) {
		var fixtures = {};
		fixtures['Budget'] = budgetFixture;
		fixtures['Pet'] = petFixture;
		return fixtures;
	}]);
