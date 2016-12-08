var Helper = {
	iteratorArr: function(arr, promiseCallback) {
		var it = arr[Symbol.iterator]();
		var list = [];
		return (function iterator(item) {
			if (item.done) {
				return Promise.resolve(list);
			}
			return promiseCallback(item.value).then((value) => {
				return list.push(value);
			}).then(() => {

				return iterator(it.next());
			}).catch(Promise.reject)
		})(it.next())
	},

	iteratorArrAsync: function(arr, promiseCallback) {
		var promises = arr.map(promiseCallback);
		return Promise.all(promises)
	},

	filterPoint: filterPoint
}


function filterPoint(arr) {
	arr = arr.map((x) => {
		return x[0] + "," + x[1];
	})
	arr = filterSameNext(arr);
	arr = arr.map((x) => x.split(","));
	return arr;
}

function filterSameNext(arr) {
	var arr2 = [];
	var flag = true;
	arr.reduce(function(previous, current) {
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