(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Helper = {
	iteratorArr: function iteratorArr(arr, promiseCallback) {
		var it = arr[Symbol.iterator]();
		var list = [];
		return function iterator(item) {
			if (item.done) {
				return Promise.resolve(list);
			}
			return promiseCallback(item.value).then(function (value) {
				return list.push(value);
			}).then(function () {

				return iterator(it.next());
			}).catch(Promise.reject);
		}(it.next());
	},

	iteratorArrAsync: function iteratorArrAsync(arr, promiseCallback) {
		var promises = arr.map(promiseCallback);
		return Promise.all(promises);
	},

	filterPoint: filterPoint
};

function filterPoint(arr) {
	arr = arr.map(function (x) {
		return x[0] + "," + x[1];
	});
	arr = filterSameNext(arr);
	arr = arr.map(function (x) {
		return x.split(",");
	});
	return arr;
}

function filterSameNext(arr) {
	var arr2 = [];
	var flag = true;
	arr.reduce(function (previous, current) {
		if (flag) {
			arr2.push(previous);
			flag = false;
		}
		if (previous != current) {
			arr2.push(current);
		}
		return current;
	});
	return arr2;
}

module.exports = Helper;

},{}],2:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var walkRoute = require("./walkRoute.js");
var Helper = require("./helper.js");
var G_Map, G_Line;
$(function () {
	initMap();

	$("#search").click(function () {
		if (G_Line) {
			G_Map.removeOverlay(G_Line);
		}
		var id = $("#userId").val();
		var date = $("#date").val();
		if (id == "") {
			id = "ff7cfb0e717cc3a48af443209168ef92";
		}
		if (date == "") {
			date = "20160105";
		}
		var url = "api/route/" + id + "/" + date;
		$.getJSON(url, function (json, textStatus) {
			if (json.result == true) {
				if (json.data != null) {
					walkLine(json.data.route);
				} else {
					alert("没有找到记录");
				}
			} else {
				alert("加载错误!");
			}
		});
	});
});

function walkLine(route) {
	console.log(Helper.filterPoint(route), "filter");
	var points = makePoint(Helper.filterPoint(route));
	G_Map.centerAndZoom(points[0], 15);
	walkRoute.line.apply(walkRoute, [G_Map].concat(_toConsumableArray(points))).then(function (_ref) {
		var line = _ref.line;
		var arr = _ref.arr;

		G_Line = line;
		saveWalkLine(arr);
	});
}

function saveWalkLine(arr) {
	var pois = arr.map(function (point) {
		return point.lng + "," + point.lat;
	});
	$("#path").text(pois.join(";"));
}

function makePoint(arr) {
	return arr.map(function (it) {
		return new (Function.prototype.bind.apply(BMap.Point, [null].concat(_toConsumableArray(it))))();
	});
}

function initMap() {
	var map = G_Map = new BMap.Map("map"); // 创建地图实例  
	var top_left_navigation = new BMap.NavigationControl();
	var point = new BMap.Point(121.39324, 31.21182001); // 创建点坐标  
	map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别  
	map.addControl(top_left_navigation);
	map.enableScrollWheelZoom(); //启用滚轮放大缩小，默认禁用
	map.enableContinuousZoom(); //启用地图惯性拖拽，默认禁用
}

},{"./helper.js":1,"./walkRoute.js":3}],3:[function(require,module,exports){
"use strict";

var Helper = require("./helper.js");
var walkingGpsLine = function walkingGpsLine(map) {
	for (var _len = arguments.length, arr = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		arr[_key - 1] = arguments[_key];
	}

	return walkingGpsPois.apply(undefined, [map].concat(arr)).then(function (arr) {
		var line = new BMap.Polyline(arr, {
			strokeColor: '#080'
		});
		map.addOverlay(line);
		return {
			line: line,
			arr: arr
		};
	});
};

var walkingGpsPois = function walkingGpsPois(map) {
	for (var _len2 = arguments.length, arr = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
		arr[_key2 - 1] = arguments[_key2];
	}

	var lineArr = [];
	for (var i = 0; i < arr.length - 1; i++) {
		lineArr.push([arr[i], arr[i + 1]]);
	}
	return Helper.iteratorArr(lineArr, function (it) {
		return walkingLinePois(map, it[0], it[1]);
	}).then(function (arr) {
		return arr.reduce(function (previous, current) {
			return previous.concat(current);
		});;
	});
};

var walkingLinePois = function walkingLinePois(map, p1, p2) {
	return new Promise(function (resolve, reject) {
		var walking = new BMap.WalkingRoute(map);
		var arrPois = [];
		walking.search(p1, p2);
		walking.setSearchCompleteCallback(function (res) {
			var plan = res.getPlan(0);
			var route = plan.getRoute(0);
			return resolve(route.getPath());
		});
	});
};

var WalkRoute = {
	line: walkingGpsLine,
	pois: walkingGpsPois
};

module.exports = WalkRoute;

},{"./helper.js":1}]},{},[2]);
