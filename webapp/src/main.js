var walkRoute = require("./walkRoute.js")
var Helper = require("./helper.js");
var G_Map, G_Line;
$(function() {
	initMap();

	$("#search").click(function() {
		if (G_Line) {
			G_Map.removeOverlay(G_Line);
		}
		var id = $("#userId").val();
		var date = $("#date").val();
		if (id == "") {
			id = "ff7cfb0e717cc3a48af443209168ef92"
		}
		if (date == "") {
			date = "20160105"
		}
		var url = `api/route/${id}/${date}`;
		$.getJSON(url, function(json, textStatus) {
			if (json.result == true) {
				if (json.data != null) {
					walkLine(json.data.route);
				} else {
					alert("没有找到记录")
				}
			} else {
				alert("加载错误!")
			}
		});
	})
})

function walkLine(route) {
	console.log(Helper.filterPoint(route), "filter");
	var points = makePoint(Helper.filterPoint(route));
	G_Map.centerAndZoom(points[0], 15);
	walkRoute.line(G_Map, ...points).then(function({
		line,
		arr
	}) {
		G_Line = line;
		saveWalkLine(arr);
	})
}

function saveWalkLine(arr) {
	var pois = arr.map((point) => {
		return point.lng + "," + point.lat
	})
	$("#path").text(pois.join(";"))
}

function makePoint(arr) {
	return arr.map((it) => {
		return new BMap.Point(...it)
	})
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