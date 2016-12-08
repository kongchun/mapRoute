var Helper = require("./helper.js");
var walkingGpsLine = function(map, ...arr) {
	return walkingGpsPois(map, ...arr).then(function(arr) {
		var line = new BMap.Polyline(arr, {
			strokeColor: '#080'
		})
		map.addOverlay(line);
		return {
			line,
			arr
		};
	})
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
	pois: walkingGpsPois
}

module.exports = WalkRoute;