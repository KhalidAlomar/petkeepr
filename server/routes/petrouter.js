var express = require('express');
var inherits = require('inherits');

module.exports = createPetRouter;

function createPetRouter(models) {
	var router = express.Router();
	router.models = models;

	router.get('/', function(req, res) {
		var Pet = router.models['Pet'];
		Pet.findAll().success(function(pets) {
			res.send(pets);
		});
	});

	return router;
}