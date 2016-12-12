var Helper = require("./helper.js");

var startIcon = new BMap.Icon("images/start.png", new BMap.Size(60, 60));
var endIcon = new BMap.Icon("images/end.png", new BMap.Size(60, 60));
var passIcon = new BMap.Icon("images/pass.png", new BMap.Size(60, 60));
var arr = [];
var start = function(map, pt) {
	var marker = new BMap.Marker(pt, {
		icon: startIcon,
		offset: new BMap.Size(0, -30)
	});
	arr.push(marker);
	map.addOverlay(marker);
}

var end = function(map, pt) {
	var marker = new BMap.Marker(pt, {
		icon: endIcon,
		offset: new BMap.Size(0, -30)
	});
	arr.push(marker);
	map.addOverlay(marker);
}

var pass = function(map, pt) {
	var marker = new BMap.Marker(pt, {
		icon: passIcon,
		offset: new BMap.Size(0, -30)
	});
	arr.push(marker);
	map.addOverlay(marker);
}

function clear(map) {
	if (arr.length > 0) {
		arr.map((i) => {
			map.removeOverlay(i);
		})
		arr = [];
	}
}

var points = function(map, points) {

	clear(map);
	var len = points.length;
	start(map, points[0]);

	for (var i = 1; i < len - 1; i++) {
		pass(map, points[i]);
	}

	end(map, points[len - 1]);
}

var labels = function(map, routecount) {
	routecount.map((i) => {
		label(map, i.point, i.label);
	})
}

var label = function(map, point, label) {
	var labels = label.map((i) => {
		return `<p>${i}</p>`
	}).join("");
	var opts = {
		position: point, // 指定文本标注所在的地理位置
		offset: new BMap.Size(25, -(12 * label.length) - 30) //设置文本偏移量
	}
	var label = new BMap.Label(labels, opts); // 创建文本标注对象
	label.setStyle({
		borderColor: "#222"

	});
	arr.push(label);
	map.addOverlay(label);
}

var Marker = {
	points: points,
	start: start,
	end: end,
	pass: pass,
	labels: labels
}

module.exports = Marker;