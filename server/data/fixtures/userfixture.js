"use strict";

module.exports = UserFixture;

function UserFixture(Model) {
	this._Model = Model;
}

UserFixture.prototype.start = function() {
	// Return the promise...
  	return this._Model.bulkCreate([
	  	{ userName: 'shaun', password: 'shaun' },
	  	{ userName: 'trent', password: 'trent' },
	  	{ userName: 'lisa', password: 'lisa' }
  	]);
}