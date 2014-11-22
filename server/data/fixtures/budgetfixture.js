"use strict";

module.exports = BudgetFixture;

function BudgetFixture(BudgetModel) {
	this._BudgetModel = BudgetModel;
}

BudgetFixture.prototype.start = function() {
	// Return the promise...
  	return this._BudgetModel.bulkCreate([
	  	{ name: "Budget 2012", startDate: new Date(2012, 1, 1), endDate: new Date(2012, 12, 31) },
	  	{ name: "Budget 2013", startDate: new Date(2013, 1, 1), endDate: new Date(2013, 12, 31) }
  	]);
}