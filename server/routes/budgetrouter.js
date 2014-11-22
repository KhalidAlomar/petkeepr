var express = require('express');
var inherits = require('inherits');

module.exports = createBudgetRouter;

function createBudgetRouter(models) {
	var router = express.Router();
	router.models = models;

	router.get('/', function(req, res) {
		var Budget = router.models['Budget'];
		Budget.findAll().success(function(budgets) {
			res.send(budgets);
		});
	});

	return router;
}