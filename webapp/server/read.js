var db = require('./db.js');

exports.getWithDateAndId = function(id, date) {
	//{"result":true,"data":{"_id":"584e119559a5f00f64d8c1d3","norepeatroute":[[121.42934,31.13303001],[121.45268,31.24955],[121.43998,31.17283001],[121.43265,31.12860001],[121.46175,31.29407]],"routecount":[{"timerange":["0点","4点"],"location":[121.42934,31.13303001],"time":[0,4]},{"timerange":["8点","18点"],"location":[121.45268,31.24955],"time":[8,18]},{"timerange":["19点"],"location":[121.43998,31.17283001],"time":[19]},{"timerange":["20点"],"location":[121.43265,31.12860001],"time":[20]},{"timerange":["23点"],"location":[121.46175,31.29407],"time":[23]}]}}
	return db.open("location").then(function(collection) {
		return collection.findOne({
			"IMEI": id,
			"date": date
		}, {
			norepeatroute: 1,
			routecount: 1,
			walkRoute: 1
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