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

	router.get('/:id', function(req, res, next) {
		var Pet = router.models['Pet'];
		Pet.find(req.params.id)
			.success(function(pet) {
				if (pet === null) {
			        var err = new Error('Not Found');
			        err.status = 404;
			        next(err);
				} else {
					res.send({pet: pet});
				}
			});
	});

	// router.post('/', function(req, res) {
		
	// 	var bear = new Bear(); 		// create a new instance of the Bear model
	// 	console.log('POST received: ' + req.body);

	// 	save the bear and check for errors
	// 	bear.save(function(err) {
	// 		if (err)
	// 			res.send(err);

	// 		res.json({ message: 'Bear created!' });
	// 	});
		
	// });

	return router;
}