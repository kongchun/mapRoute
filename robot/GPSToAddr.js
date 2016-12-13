var loader = require('./loader.js');
var db = require('./db.js');
var table = "location";
var addrTable = "address";



var arr = new Set();

function getAllLocation() {
	db.open(table).then(function() {
		return db.collection.find({}, {
			routecount: 1
		}).toArray()
	}).then(function(data) {
		db.close()
		console.log(data.length)
		data.map((local) => {
			//console.log(local._id)
			local.routecount.map((i) => {
				//console.log(i.location.join(","))
				arr.add(i.location.join(","))
			})
		})
		return arr;

	}).then(function(data) {
		let arr = [];
		data.forEach((i) => {
			var t = (i.split(","));
			var x = {
				location: [parseFloat(t[0]), parseFloat(t[1])]
			};
			arr.push(x)

		})
		return arr;

	}).then(function(data) {
		//console.log(data);
		db.open(addrTable).then(function() {
			return db.collection.insertMany(data);
		})


	}).then(function(data) {
		db.close();
		console.log("success");
		//price_db.close()

	}).then(function(data) {

	}).catch(function(e) {
		console.error(e);
		db.close();
	})


}

function runGeocoder() {
	db.open(addrTable).then(function() {
		return db.collection.findOne({
			result: null
		});
	}).then(function(data) {
		return loadGeocoderAPI(data.location).then(function(baidu) {
			data.result = baidu.result;
			return data;
		})
	}).then(function(data) {
		console.log(data._id);
		return db.collection.save(data);
	}).then(function(data) {
		setTimeout(function() {
			runGeocoder()
		}, 100)
	}).catch(function(err) {
		db.close();
		console.log(err);
	})
}
//
runGeocoder()
	// var location = [121.2839, 31.34085001];
	// loadGeocoderAPI(location).then(function(data) {
	// 	console.log(data.result);
	// 	data.result.pois.map((i) => {
	// 		console.log(i)
	// 	})
	// })

function loadGeocoderAPI(points) {
	function getUrl(points) {
		//return `http://api.map.baidu.com/geocoder/v2/?output=json&address=${name}&city=${city}&ak=8hr2ZB5zsFI6dcId9Uj6ORy2kuLIP8vA`
		var str = points[1] + "," + points[0];
		return `http://api.map.baidu.com/geocoder/v2/?location=${str}&output=json&pois=2&ak=8hr2ZB5zsFI6dcId9Uj6ORy2kuLIP8vA`
	}

	var url = encodeURI(getUrl(points));
	return loader.getJSON((url)).then(function(data) {
		return data;
	}).catch(function(e) {
		console.log(e);
	})
}