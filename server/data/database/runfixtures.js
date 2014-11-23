"use strict";

var di = require('ng-di');

require('../fixtures');
var angularModule = di.module('modMain', ['modFixtures']);

angularModule.run(['fixtures', function(fixtures) {
	console.log("Fixtures starting...");

	var userFixture = fixtures['User'];
	var petFixture = fixtures['Pet'];

	userFixture.start()
		.then(petFixture.start())
		.done();
		
	console.log("Fixture complete");
}]);

di.injector(['modMain']);
