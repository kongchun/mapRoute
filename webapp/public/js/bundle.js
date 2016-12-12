(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var GPS = {
	PI: 3.14159265358979324,
	x_pi: 3.14159265358979324 * 3000.0 / 180.0,
	delta: function delta(lat, lon) {
		// Krasovsky 1940
		//
		// a = 6378245.0, 1/f = 298.3
		// b = a * (1 - f)
		// ee = (a^2 - b^2) / a^2;
		var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
		var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
		var dLat = this.transformLat(lon - 105.0, lat - 35.0);
		var dLon = this.transformLon(lon - 105.0, lat - 35.0);
		var radLat = lat / 180.0 * this.PI;
		var magic = Math.sin(radLat);
		magic = 1 - ee * magic * magic;
		var sqrtMagic = Math.sqrt(magic);
		dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * this.PI);
		dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * this.PI);
		return {
			'lat': dLat,
			'lon': dLon
		};
	},

	//WGS-84 to GCJ-02
	gcj_encrypt: function gcj_encrypt(wgsLat, wgsLon) {
		if (this.outOfChina(wgsLat, wgsLon)) return {
			'lat': wgsLat,
			'lon': wgsLon
		};

		var d = this.delta(wgsLat, wgsLon);
		return {
			'lat': wgsLat + d.lat,
			'lon': wgsLon + d.lon
		};
	},
	//GCJ-02 to WGS-84
	gcj_decrypt: function gcj_decrypt(gcjLat, gcjLon) {
		if (this.outOfChina(gcjLat, gcjLon)) return {
			'lat': gcjLat,
			'lon': gcjLon
		};

		var d = this.delta(gcjLat, gcjLon);
		return {
			'lat': gcjLat - d.lat,
			'lon': gcjLon - d.lon
		};
	},
	//GCJ-02 to WGS-84 exactly
	gcj_decrypt_exact: function gcj_decrypt_exact(gcjLat, gcjLon) {
		var initDelta = 0.01;
		var threshold = 0.000000001;
		var dLat = initDelta,
		    dLon = initDelta;
		var mLat = gcjLat - dLat,
		    mLon = gcjLon - dLon;
		var pLat = gcjLat + dLat,
		    pLon = gcjLon + dLon;
		var wgsLat,
		    wgsLon,
		    i = 0;
		while (1) {
			wgsLat = (mLat + pLat) / 2;
			wgsLon = (mLon + pLon) / 2;
			var tmp = this.gcj_encrypt(wgsLat, wgsLon);
			dLat = tmp.lat - gcjLat;
			dLon = tmp.lon - gcjLon;
			if (Math.abs(dLat) < threshold && Math.abs(dLon) < threshold) break;

			if (dLat > 0) pLat = wgsLat;else mLat = wgsLat;
			if (dLon > 0) pLon = wgsLon;else mLon = wgsLon;

			if (++i > 10000) break;
		}
		//console.log(i);
		return {
			'lat': wgsLat,
			'lon': wgsLon
		};
	},
	//GCJ-02 to BD-09
	bd_encrypt: function bd_encrypt(gcjLat, gcjLon) {
		var x = gcjLon,
		    y = gcjLat;
		var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
		var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
		var bdLon = z * Math.cos(theta) + 0.0065;
		var bdLat = z * Math.sin(theta) + 0.006;
		return {
			'lat': bdLat,
			'lon': bdLon
		};
	},
	//BD-09 to GCJ-02
	bd_decrypt: function bd_decrypt(bdLat, bdLon) {
		var x = bdLon - 0.0065,
		    y = bdLat - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
		var gcjLon = z * Math.cos(theta);
		var gcjLat = z * Math.sin(theta);
		return {
			'lat': gcjLat,
			'lon': gcjLon
		};
	},
	//WGS-84 to Web mercator
	//mercatorLat -> y mercatorLon -> x
	mercator_encrypt: function mercator_encrypt(wgsLat, wgsLon) {
		var x = wgsLon * 20037508.34 / 180.;
		var y = Math.log(Math.tan((90. + wgsLat) * this.PI / 360.)) / (this.PI / 180.);
		y = y * 20037508.34 / 180.;
		return {
			'lat': y,
			'lon': x
		};
		/*
  if ((Math.abs(wgsLon) > 180 || Math.abs(wgsLat) > 90))
      return null;
  var x = 6378137.0 * wgsLon * 0.017453292519943295;
  var a = wgsLat * 0.017453292519943295;
  var y = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
  return {'lat' : y, 'lon' : x};
  //*/
	},
	// Web mercator to WGS-84
	// mercatorLat -> y mercatorLon -> x
	mercator_decrypt: function mercator_decrypt(mercatorLat, mercatorLon) {
		var x = mercatorLon / 20037508.34 * 180.;
		var y = mercatorLat / 20037508.34 * 180.;
		y = 180 / this.PI * (2 * Math.atan(Math.exp(y * this.PI / 180.)) - this.PI / 2);
		return {
			'lat': y,
			'lon': x
		};
		/*
  if (Math.abs(mercatorLon) < 180 && Math.abs(mercatorLat) < 90)
      return null;
  if ((Math.abs(mercatorLon) > 20037508.3427892) || (Math.abs(mercatorLat) > 20037508.3427892))
      return null;
  var a = mercatorLon / 6378137.0 * 57.295779513082323;
  var x = a - (Math.floor(((a + 180.0) / 360.0)) * 360.0);
  var y = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * mercatorLat) / 6378137.0)))) * 57.295779513082323;
  return {'lat' : y, 'lon' : x};
  //*/
	},
	// two point's distance
	distance: function distance(latA, lonA, latB, lonB) {
		var earthR = 6371000.;
		var x = Math.cos(latA * this.PI / 180.) * Math.cos(latB * this.PI / 180.) * Math.cos((lonA - lonB) * this.PI / 180);
		var y = Math.sin(latA * this.PI / 180.) * Math.sin(latB * this.PI / 180.);
		var s = x + y;
		if (s > 1) s = 1;
		if (s < -1) s = -1;
		var alpha = Math.acos(s);
		var distance = alpha * earthR;
		return distance;
	},
	outOfChina: function outOfChina(lat, lon) {
		if (lon < 72.004 || lon > 137.8347) return true;
		if (lat < 0.8293 || lat > 55.8271) return true;
		return false;
	},
	transformLat: function transformLat(x, y) {
		var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
		ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
		return ret;
	},
	transformLon: function transformLon(x, y) {
		var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
		ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
		return ret;
	}
};

module.exports = GPS;

},{}],2:[function(require,module,exports){
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
	arr = filterSameNextStr(arr);
	arr = arr.map(function (x) {
		return x.split(",");
	});
	return arr;
}

function filterSameNextStr(arr) {
	var p,
	    arr2 = [];
	arr.forEach(function (i) {
		if (i != p || !p) {
			arr2.push(i);
		}
		p = i;
	});
	return arr2;
}

module.exports = Helper;

},{}],3:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var walkRoute = require("./walkRoute.js");
var Helper = require("./helper.js");
var GPS = require("./gps.js");
var marker = require("./marker.js");
var G_Map;
$(function () {
	initMap();

	$("#search").click(function () {

		var id = $("#userId").val();
		var date = $("#date").val();

		var url = "api/route/" + id + "/" + date;
		$.getJSON(url, function (json, textStatus) {
			if (json.result) {
				if (json.data && json.data.norepeatroute) {
					renderMap(json.data.norepeatroute, json.data.routecount);
				} else {
					alert("没有找到记录");
				}
			} else {
				alert("加载错误!");
			}
		});
	});

	// var labels = getLabels();
	// marker.labels(G_Map, labels);
	// console.log("labels", labels)
});

function gpsCover(lng, lat) {

	var bd = GPS.bd_encrypt(lat, lng);
	return [parseFloat(bd.lon), parseFloat(bd.lat)];
}

function renderMap(route, count) {
	walkLine(route);
	var points = makePoint(route);
	marker.points(G_Map, points);

	var labels = getLabels(count);
	marker.labels(G_Map, labels);
}

function getLabels(count) {

	var labels = count.map(function (item) {
		var location = item.location;
		var label = item.timerange;
		var point = new (Function.prototype.bind.apply(BMap.Point, [null].concat(_toConsumableArray(location))))();

		return {
			point: point,
			label: label
		};
	});

	return labels;
}

function walkLine(route) {
	//console.log(Helper.filterPoint(route), "filter");
	var points = makePoint(Helper.filterPoint(route));
	G_Map.setViewport(points);
	walkRoute.line.apply(walkRoute, [G_Map].concat(_toConsumableArray(points))).then(function (arr) {});
}

function saveWalkLine(arr) {
	var pois = arr.map(function (point) {
		return point.lng + "," + point.lat;
	});
	$("#path").text(pois.join(";"));
}

function makePoint(arr) {

	return arr.map(function (it) {
		//it = gpsCover(...it);
		return new (Function.prototype.bind.apply(BMap.Point, [null].concat(_toConsumableArray(it))))();
	});
}

function initMap() {
	var map = G_Map = new BMap.Map("map"); // 创建地图实例  
	var top_left_navigation = new BMap.NavigationControl();
	var top_left_control = new BMap.ScaleControl({
		anchor: BMAP_ANCHOR_TOP_RIGHT
	}); // 左上角，添加比例尺
	var point = new BMap.Point(121.39324, 31.21182001); // 创建点坐标  
	map.centerAndZoom(point, 12); // 初始化地图，设置中心点坐标和地图级别  
	map.addControl(top_left_navigation);
	map.addControl(top_left_control);
	map.enableScrollWheelZoom(); //启用滚轮放大缩小，默认禁用
	map.enableContinuousZoom(); //启用地图惯性拖拽，默认禁用
}

},{"./gps.js":1,"./helper.js":2,"./marker.js":4,"./walkRoute.js":5}],4:[function(require,module,exports){
"use strict";

var Helper = require("./helper.js");

var startIcon = new BMap.Icon("images/start.png", new BMap.Size(60, 60));
var endIcon = new BMap.Icon("images/end.png", new BMap.Size(60, 60));
var passIcon = new BMap.Icon("images/pass.png", new BMap.Size(60, 60));
var arr = [];
var start = function start(map, pt) {
	var marker = new BMap.Marker(pt, {
		icon: startIcon,
		offset: new BMap.Size(0, -30)
	});
	arr.push(marker);
	map.addOverlay(marker);
};

var end = function end(map, pt) {
	var marker = new BMap.Marker(pt, {
		icon: endIcon,
		offset: new BMap.Size(0, -30)
	});
	arr.push(marker);
	map.addOverlay(marker);
};

var pass = function pass(map, pt) {
	var marker = new BMap.Marker(pt, {
		icon: passIcon,
		offset: new BMap.Size(0, -30)
	});
	arr.push(marker);
	map.addOverlay(marker);
};

function clear(map) {
	if (arr.length > 0) {
		arr.map(function (i) {
			map.removeOverlay(i);
		});
		arr = [];
	}
}

var points = function points(map, _points) {

	clear(map);
	var len = _points.length;
	start(map, _points[0]);

	for (var i = 1; i < len - 1; i++) {
		pass(map, _points[i]);
	}

	end(map, _points[len - 1]);
};

var labels = function labels(map, routecount) {
	routecount.map(function (i) {
		label(map, i.point, i.label);
	});
};

var label = function label(map, point, label) {
	var labels = label.map(function (i) {
		return "<p>" + i + "</p>";
	}).join("");
	var opts = {
		position: point, // 指定文本标注所在的地理位置
		offset: new BMap.Size(25, -(12 * label.length) - 30) //设置文本偏移量
	};
	var label = new BMap.Label(labels, opts); // 创建文本标注对象
	label.setStyle({
		borderColor: "#222"

	});
	arr.push(label);
	map.addOverlay(label);
};

var Marker = {
	points: points,
	start: start,
	end: end,
	pass: pass,
	labels: labels
};

module.exports = Marker;

},{"./helper.js":2}],5:[function(require,module,exports){
"use strict";

var Helper = require("./helper.js");
var arr = [];

function clear(map) {
	if (arr.length > 0) {
		arr.map(function (i) {
			map.removeOverlay(i);
		});
		arr = [];
	}
}

var walkingGpsLine = function walkingGpsLine(map) {
	clear(map);

	for (var _len = arguments.length, points = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		points[_key - 1] = arguments[_key];
	}

	return walkingGpsPois.apply(undefined, [map].concat(points)).then(function (point) {
		var line = new BMap.Polyline(point, {
			strokeColor: '#080'
		});
		arr.push(line);
		map.addOverlay(line);
		return arr;
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

},{"./helper.js":2}]},{},[3]);
