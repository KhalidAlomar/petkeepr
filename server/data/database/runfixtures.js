"use strict";

var di = require('ng-di');

require('../fixtures');
var angularModule = di.module('modMain', ['modFixtures']);

angularModule.run(['fixtures', function(fixtures) {
	console.log("Fixtures starting...");

	var budgetFixture = fixtures['Budget'];
	var petFixture = fixtures['Pet'];

	budgetFixture.start()
		.then(petFixture.start())
		.done();
		
	console.log("Fixture complete");
}]);

di.injector(['modMain']);
