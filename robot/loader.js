var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var request = require('request');



var Loader = function(url, options, callback) {
	if (typeof options == 'function') {
		callback = options;
		options = {};
	}
	options = options || {};

	var {
		charset = "UTF8",
			header = {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
			}
	} = options;

	return new Promise(function(resolve, reject) {
		let options = {
			url: url,
			encoding: null,
			headers: header
		};
		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var html = iconv.decode(body, charset);

				var $ = cheerio.load(html, {
					withDomLvl1: true,
					normalizeWhitespace: true,
					xmlMode: false,
					decodeEntities: false
				});
				callback && callback(error, $);
				resolve($);
			} else {
				callback && callback(error, response);
				reject(error);
			}
		});

	})
}

Loader.getJSON = function(url, options, callback) {
	if (typeof options == 'function') {
		callback = options;
		options = {};
	}
	options = options || {};

	var {
		charset = "UTF8",
			header = {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
			}
	} = options;

	return new Promise(function(resolve, reject) {
		let options = {
			url: url,
			encoding: null,
			headers: header
		};
		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var str = iconv.decode(body, charset);

				var json = JSON.parse(str)
				callback && callback(error, json);
				resolve(json);
			} else {
				callback && callback(error, response);
				reject(error);
			}
		});

	})
}

module.exports = Loader;

/*
Loader("http://163.com", {
	charset: "GB2312"
}).then(function($) {
	console.log($("title").text())
});
*/

/*
Loader("http://dataunion.org/25727.html", function(res) {
	console.log(res.success);
	var $ = res.data;
	console.log($("html").html())
});
*/

/*
const host = "dataunion.org";
const path = "/25727.html";
var options = {
	host: host,
	port: 80,
	path: path,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
	}
};
*/


/*
var html = ""
http.get(options, function(res) {
	res.on('data', function(data) {
		html += data;
		console.log(data)
	});
	res.on('end', function() {
		var $ = cheerio.load(html, {
			decodeEntities: false
		});
		console.log(html);
		console.log($("title").text())
		console.log($("body").text())
	});
}).on('error', function(e) {
	console.log(path)
	console.log(e)
})
*/
/*
http.get(options, function(res) {
	var bufferHelper = new BufferHelper();
	res.on('data', function(data) {
		bufferHelper.concat(data);
		console.log(data)
	});
	res.on('end', function() {
		var html = iconv.decode(bufferHelper.toBuffer(), 'utf8');
		var $ = cheerio.load(html, {
			decodeEntities: false
		});
		console.log(html)
		console.log($("title").text())
		console.log($("body").html())
	});
}).on('error', function(e) {
	console.log(path)
	console.log(e)
})
*/
/*
var request = require('request');
var options = {
	url: 'http://www.163.com',
	encoding: null,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
	}
};

function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
		var html = iconv.decode(body, 'gb2312');
		var $ = cheerio.load(html, {
			decodeEntities: false
		});
		console.log(html)
		console.log($("title").text())
		console.log($("body").html())
	}
}

request(options, callback);
*/