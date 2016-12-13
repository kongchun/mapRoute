var Helper = require("./helper.js");
var arr = [];


function clear(map) {
	if (arr.length > 0) {
		arr.map((i) => {
			map.removeOverlay(i);
		})
		arr = [];
	}
}

var walkingGpsLine = function(map, ...points) {

	return walkingGpsPois(map, ...points).then(function(point) {
		return polyline(map, point);
	})
}

var polyline = function(map, points) {
	clear(map);
	var line = new BMap.Polyline(points, {
		strokeColor: '#080'
	})
	arr.push(line);
	map.addOverlay(line);
	return Promise.resolve(points);
}

var walkingGpsPois = function(map, ...arr) {
	var lineArr = [];
	for (var i = 0; i < arr.length - 1; i++) {
		lineArr.push([arr[i], arr[i + 1]])
	}
	return Helper.iteratorArr(lineArr, function(it) {
		return walkingLinePois(map, it[0], it[1])
	}).then(function(arr) {
		return arr.reduce(function(previous, current) {
			return previous.concat(current);
		});;

	})
}

var walkingLinePois = function(map, p1, p2) {
	return new Promise((resolve, reject) => {
		var walking = new BMap.WalkingRoute(map);
		var arrPois = []
		walking.search(p1, p2);
		walking.setSearchCompleteCallback(function(res) {
			var plan = res.getPlan(0);
			var route = plan.getRoute(0);
			return resolve(route.getPath());
		})
	})

}


var WalkRoute = {
	line: walkingGpsLine,
	pois: walkingGpsPois,
	polyline: polyline
}

module.exports = WalkRoute;