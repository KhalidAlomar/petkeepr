"use strict";

var di = require('ng-di');

require('../../lib/models');
var angularModule = di.module('modFixtures', ['modModels']);
module.exports = angularModule;

var UserFixture = require('./userfixture');
angularModule.service('userFixture', ['userModel', UserFixture]);

var PetFixture = require('./petfixture');
angularModule.service('petFixture', ['petModel', PetFixture]);

angularModule.factory('fixtures', [
	'userFixture',
	'petFixture',
	function (userFixture, petFixture) {
		var fixtures = {};
		fixtures['User'] = userFixture;
		fixtures['Pet'] = petFixture;
		return fixtures;
	}]);
