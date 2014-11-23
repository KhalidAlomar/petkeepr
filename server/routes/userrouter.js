var express = require('express');
var inherits = require('inherits');

module.exports = createUserRouter;

function createUserRouter(models) {
	var router = express.Router();
	router.models = models;
	var User = router.models['User'];

	router.get('/', function(req, res) {
		User.findAll().success(function(budgets) {
			res.send(budgets);
		});
	});

	router.get('/:id', function(req, res, next) {
		User.find(req.params.id)
			.success(function(user) {
				if (user === null) {
			        var err = new Error('Not Found');
			        err.status = 404;
			        next(err);
				} else {
					res.send({user: user});
				}
			});
	});

	router.post('/', function(req, res, next) {
		console.log("POST name: " + req.body.name);
		res.send("Body name: " + JSON.stringify(req.body.name));
	});

	return router;
}