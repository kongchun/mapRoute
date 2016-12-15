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

//划线
var polyline = function(map, points) {
	clear(map);
	var line = new BMap.Polyline(points, {
		strokeColor: '#080'
	})
	arr.push(line);
	map.addOverlay(line);
	return Promise.resolve(points);
}


var line = function(map, ...points) {
	return getLinePoints(map, ...points).then(function(point) {
		return polyline(map, point);
	})
}

var getLinePoints = function(map, ...arr) {
	var lineArr = [];
	for (var i = 0; i < arr.length - 1; i++) {
		lineArr.push([arr[i], arr[i + 1]])
	}
	return Helper.iteratorArr(lineArr, function(it) {
		var p1 = it[0];
		var p2 = it[1];

		if (map.getDistance(p1, p2) > 2000) {
			return getDrivingPointsByStartEnd(map, p1, p2)
		} else {
			return getWalkingPointsByStartEnd(map, p1, p2)
		}
	}).then(function(arr) {
		return arr.reduce(function(previous, current) {
			return previous.concat(current);
		});;

	})
}

var walkingLine = function(map, ...points) {
	return getWalkingPoints(map, ...points).then(function(point) {
		return polyline(map, point);
	})
}

var getWalkingPoints = function(map, ...arr) {
	var lineArr = [];
	for (var i = 0; i < arr.length - 1; i++) {
		lineArr.push([arr[i], arr[i + 1]])
	}
	return Helper.iteratorArr(lineArr, function(it) {
		return getWalkingPointsByStartEnd(map, it[0], it[1])
	}).then(function(arr) {
		return arr.reduce(function(previous, current) {
			return previous.concat(current);
		});;

	})
}

var getWalkingPointsByStartEnd = function(map, p1, p2) {
	return new Promise((resolve, reject) => {
		var walking = new BMap.WalkingRoute(map);
		var arrPoints = []
		walking.search(p1, p2);
		walking.setSearchCompleteCallback(function(res) {
			var plan = res.getPlan(0);
			var route = plan.getRoute(0);
			return resolve(route.getPath());
		})
	})
}

var drivingLine = function(map, ...points) {
	return getDrivingLinePoints(map, ...points).then(function(point) {
		return polyline(map, point);
	})
}

var getDrivingLinePoints = function(map, ...arr) {
	var lineArr = [];
	for (var i = 0; i < arr.length - 1; i++) {
		lineArr.push([arr[i], arr[i + 1]])
	}
	return Helper.iteratorArr(lineArr, function(it) {
		return getDrivingPointsByStartEnd(map, it[0], it[1])
	}).then(function(arr) {
		return arr.reduce(function(previous, current) {
			return previous.concat(current);
		});;

	})
}



var getDrivingPointsByStartEnd = function(map, p1, p2) {
	return new Promise((resolve, reject) => {
		var driving = new BMap.DrivingRoute(map, {
			policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE
		});
		var arrPoints = []
		driving.search(p1, p2);
		driving.setSearchCompleteCallback(function(res) {
			var plan = res.getPlan(0);
			var route = plan.getRoute(0);
			return resolve(route.getPath());
		})
	})

}


var route = {
	line: line,
	getLinePoints: getLinePoints,

	polyline: polyline,
	walkingLine: walkingLine,
	drivingLine: drivingLine,

	getWalkingPoints: getWalkingPoints,
	getDrivingLinePoints: getDrivingLinePoints

	//getWalkingPointsByStartEnd: getWalkingPointsByStartEnd,
	//getDrivingPointsByStartEnd: getDrivingPointsByStartEnd,



}

module.exports = route;