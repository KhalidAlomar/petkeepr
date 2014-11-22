"use strict";

module.exports = PetFixture;

function PetFixture(Model) {
	this._Model = Model;
}

PetFixture.prototype.start = function() {
	// Return the promise...
  	return this._Model.bulkCreate([
	  	{ name: "Frankie", startDate: new Date(2012, 1, 1), endDate: new Date(2012, 12, 31) },
	  	{ name: "Fluffy", startDate: new Date(2013, 1, 1), endDate: new Date(2013, 12, 31) }
  	]);
}