var express = require('express');
var router = express.Router();
var app = express();
var read = require('../server/read.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send({
		result: false
	});
});

router.get('/route', function(req, res, next) {

	res.send({
		result: false
	});
});

router.get('/route/:id/:date', function(req, res, next) {
	var id = (req.params.id);
	var date = (req.params.date);

	read.getWithDateAndId(id, date).then(function(data) {
		res.send({
			result: true,
			data: data
		})
	}).catch(function(e) {
		res.send({
			result: false,
			data: e
		})
	})

	// res.send({
	// 	result: true,
	// 	data: {
	// 		id: "02633ead2f2d8da761ec31e6ad1311a5",
	// 		date: "20151228",
	// 		route: [
	// 			[121.39324, 31.21182001],
	// 			[121.39033, 31.20615001],
	// 			[121.39324, 31.21182001],
	// 			[121.39033, 31.20615001],
	// 			[121.38635, 31.20833001],
	// 			[121.39324, 31.21182001],
	// 			[121.39033, 31.20615001],
	// 			[121.48143, 31.24187001],
	// 			[121.4799, 31.23779001],
	// 			[121.48036, 31.23775001],
	// 			[121.39, 31.20615001]
	// 		]
	// 	}
	// });
});



module.exports = router;