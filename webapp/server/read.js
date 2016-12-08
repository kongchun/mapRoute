var db = require('./db.js');

exports.getWithDateAndId = function(id, date) {
	return db.open("location").then(function(collection) {
		return collection.findOne({
			"IMEI": id,
			"date": date
		})
	}).then(function(data) {
		return data;
		db.close();
	}).catch(function(error) {
		db.close();
		console.error(error)
		throw error;
	})
}