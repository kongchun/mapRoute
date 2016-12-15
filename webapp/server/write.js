var db = require('./db.js');
var mongodb = require("mongodb");
var routeLine = exports.routeLine = function(_id, routeLine) {

	return db.open("location").then(function(collection) {
		return collection.update({
			_id: mongodb.ObjectId(_id)
		}, {
			$set: {
				routeLine: routeLine
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