var walkRoute = require("./walkRoute.js")
var Helper = require("./helper.js");
var GPS = require("./gps.js");
var marker = require("./marker.js");
var G_Map;
$(function() {
	initMap();

	$("#search").click(function() {

		var id = $("#userId").val();
		var date = $("#date").val();

		var url = `api/route/${id}/${date}`;
		$.getJSON(url, function(json, textStatus) {
			if (json.result) {
				if (json.data && json.data.norepeatroute) {
					renderMap(json.data.norepeatroute, json.data.routecount);
				} else {
					alert("没有找到记录")
				}
			} else {
				alert("加载错误!")
			}
		});
	})



	// var labels = getLabels();
	// marker.labels(G_Map, labels);
	// console.log("labels", labels)
})

function gpsCover(lng, lat) {

	var bd = GPS.bd_encrypt(lat, lng);
	return [parseFloat(bd.lon), parseFloat(bd.lat)]
}

function renderMap(route, count) {
	walkLine(route);
	var points = makePoint(route);
	marker.points(G_Map, points);

	var labels = getLabels(count);
	marker.labels(G_Map, labels);
	//marker.labels(labels);
}

function getLabels(count) {

	var labels = count.map((item) => {
		var location = item.location;
		var label = item.timerange;
		var point = new BMap.Point(...location);

		return {
			point,
			label
		}
	})

	return labels;

}


function walkLine(route) {
	//console.log(Helper.filterPoint(route), "filter");
	var points = makePoint(Helper.filterPoint(route));
	G_Map.centerAndZoom(points[0], 15);
	walkRoute.line(G_Map, ...points);
}

function saveWalkLine(arr) {
	var pois = arr.map((point) => {
		return point.lng + "," + point.lat
	})
	$("#path").text(pois.join(";"))
}

function makePoint(arr) {

	return arr.map((it) => {
		//it = gpsCover(...it);
		return new BMap.Point(...it)
	})
}

function initMap() {
	var map = G_Map = new BMap.Map("map"); // 创建地图实例  
	var top_left_navigation = new BMap.NavigationControl();
	var top_left_control = new BMap.ScaleControl({
		anchor: BMAP_ANCHOR_TOP_RIGHT
	}); // 左上角，添加比例尺
	var point = new BMap.Point(121.39324, 31.21182001); // 创建点坐标  
	map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别  
	map.addControl(top_left_navigation);
	map.addControl(top_left_control);
	map.enableScrollWheelZoom(); //启用滚轮放大缩小，默认禁用
	map.enableContinuousZoom(); //启用地图惯性拖拽，默认禁用
}