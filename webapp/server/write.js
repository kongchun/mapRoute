var db = require('./db.js');
var mongodb = require("mongodb");
var walkRoute = exports.walkRoute = function(_id, route) {

	return db.open("location").then(function(collection) {
		return collection.update({
			_id: mongodb.ObjectId(_id)
		}, {
			$set: {
				walkRoute: route
			}
		})
	}).then(function(data) {
		console.log(data)
		db.close();
		return data;
	}).catch(function(error) {
		db.close();
		console.error(error)
		throw error;
	})
}