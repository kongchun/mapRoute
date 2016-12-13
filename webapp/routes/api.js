var express = require('express');
var router = express.Router();
var app = express();
var read = require('../server/read.js');
var write = require('../server/write.js');
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

router.post('/route/walk', function(req, res, next) {
	var _id = (req.body._id);
	var walkRoute = JSON.parse(req.body.walkRoute);
	write.walkRoute(_id, walkRoute).then(function() {
		res.send({
			result: true
		});
	});

})

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
});


module.exports = router;