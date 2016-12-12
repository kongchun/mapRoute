var express = require('express');
var router = express.Router();
var read = require('../server/read.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	read.getIMEI().then(function(imei) {
		return imei.map((i) => {
			return i.IMEI
		})
	}).then(function(imei) {
		read.getDate().then(function(date) {
			res.render('index', {
				title: '测试路径',
				IMEI: imei,
				date: date
			});
		})
	})

});

module.exports = router;