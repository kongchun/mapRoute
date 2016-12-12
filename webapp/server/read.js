var db = require('./db.js');

exports.getWithDateAndId = function(id, date) {
	return db.open("location").then(function(collection) {
		return collection.findOne({
			"IMEI": id,
			"date": date
		}, {
			norepeatroute: 1,
			routecount: 1
		})
	}).then(function(data) {
		db.close();
		return data;
	}).catch(function(error) {
		db.close();
		console.error(error)
		throw error;
	})
}

exports.getIMEI = function(max = 50) {
	return db.open("imei").then(function(collection) {
		return collection.find({}, {
			IMEI: 1,
			_id: 0
		}).limit(max).toArray()
	}).then(function(data) {
		db.close();
		return data;
	}).catch(function(error) {
		db.close();
		console.error(error)
		throw error;
	})
}

exports.getDate = function() {
	return db.open("date").then(function(collection) {
		return collection.find({}).sort({
			date: 1
		}).toArray()
	}).then(function(data) {
		db.close();
		return data;

	}).catch(function(error) {
		db.close();
		console.error(error)
		throw error;
	})
}