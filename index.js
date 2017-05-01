// example URL for cse search: https://www.googleapis.com/customsearch/v1?key=AIzaSyD2lVlPLAtXD1ErKDqIJOrnNUVDQAfjK8U&cx=005814692936836916823:akira-or3qy&q=dogs&start=11

var express = require("express");
var request = require("request");

var app = express();
var port = process.env.PORT || 3000;

var cseKey = "AIzaSyD2lVlPLAtXD1ErKDqIJOrnNUVDQAfjK8U";
var engineId = "005814692936836916823:akira-or3qy";
var cseBaseQuery = "https://www.googleapis.com/customsearch/v1?key="+
				cseKey + "&cx=" + engineId + "&searchType=image&q=";

var invokeAndProcessGoogleResults = function(query, pageNum, callback) {
	var apiCallString = "";
	if(pageNum !== null) {
		var startParamter = pageNum * 10 + 1;
		apiCallString = cseBaseQuery+query+"&start="+startParamter;
	}else {
		apiCallString = cseBaseQuery+query;
	}

	request(apiCallString, function(err, res, body) {
		var resultsArray = JSON.parse(body).items;
		var refinedResultsArray = [];

		resultsArray.forEach(function(result) {
			var refinedResult = {};

			refinedResult.url = result.link;
			refinedResult.snippet = result.snippet;
			refinedResult.thumbnail = result.image.thumbnailLink;
			refinedResult.context = result.image.contextLink;

			refinedResultsArray.push(refinedResult);
		});

		callback(refinedResultsArray);
	});
};

app.get("/:queryString", function(req, res) {
	var query = req.params.queryString;
	var pageNum = null;
	if(/offset/.test(req._parsedUrl.query)) {
		pageNum = req._parsedUrl.query.match(/offset=(\d+)/)[1];
	}
	invokeAndProcessGoogleResults(query, pageNum, function(result) {
		res.send(result);
	});
});

app.listen(port, function() {
	console.log("App now running at http://localhost:" + port);
})