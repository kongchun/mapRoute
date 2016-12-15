var route = require("./route.js")
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
					renderMap(json.data);
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
	//saverouteLine()
})

function gpsCover(lng, lat) {

	var bd = GPS.bd_encrypt(lat, lng);
	return [parseFloat(bd.lon), parseFloat(bd.lat)]
}

function renderMap(data) {
	var norepeatroute = data.norepeatroute;
	var routecount = data.routecount;
	var _id = data._id;
	var routeLineData = data.routeLine;

	var points = makePoint((norepeatroute));
	G_Map.setViewport(points);

	if (routeLineData) {
		//console.log(routeLineData)
		route.polyline(G_Map, routeLineData.map((point) => {
			return new BMap.Point(point.lng, point.lat);
		}));
	} else {
		routeLine(_id, points);
	}

	marker.points(G_Map, points);
	marker.labels(G_Map, routecount);
}



function routeLine(_id, points) {
	//console.log(Helper.filterPoint(route), "filter");

	route.line(G_Map, ...points).then(function(arr) {
		saveLine(_id, arr);
	});
}

function saveLine(_id, routePath) {

	/*var _id = "584e119559a5f00f64d8c1d3";
	var walkRoute = [{
		lng: 121.429368,
		lat: 31.132967
	}]
*/
	var url = "api/route/line";
	$.post(url, {
		_id: _id,
		line: JSON.stringify(routePath)
	}, function() {

	})
}

function saverouteLine(arr) {
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
	map.centerAndZoom(point, 12); // 初始化地图，设置中心点坐标和地图级别  
	map.addControl(top_left_navigation);
	map.addControl(top_left_control);
	map.enableScrollWheelZoom(); //启用滚轮放大缩小，默认禁用
	map.enableContinuousZoom(); //启用地图惯性拖拽，默认禁用
}