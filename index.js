
var express = require("express");
var request = require("request");
var mongoose = require("mongoose");
var SearchQuery = require("./searchSchema.js");

var app = express();
var port = process.env.PORT || 3000;
var mongoURL = process.env.MONGODB_URI || "mongodb://localhost:27017/";

mongoose.connect("mongodb://localhost:27017/");
mongoose.Promise = global.Promise;

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

	var currentDate = Date.now();
	SearchQuery.create({
		"query": query,
		"date": currentDate
	})

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

app.get("/", function(req,res) {
	res.send("Put an image search query at the end of the URL (exp: '/cats') or '/latestsearches' to see what others are searching for.");
});

app.get("/latestsearches", function(req, res) {
	SearchQuery.find().sort("-date").limit(10).then(function(queries) {
		var resultsList = [];
		queries.forEach(function(query) {
			var result = {
				"query": query.query,
				"date": query.date
			}
			resultsList.push(result);
		});
		res.send(resultsList);
	});
});

app.get("/:queryString", function(req, res) {
	if (req.url != "/favicon.ico") {
		var query = req.params.queryString;
		var pageNum = null;
		if(/offset/.test(req._parsedUrl.query)) {
			pageNum = req._parsedUrl.query.match(/offset=(\d+)/)[1];
		}
		invokeAndProcessGoogleResults(query, pageNum, function(result) {
			res.send(result);
		});
	}
});

app.listen(port, function() {
	console.log("App now running at http://localhost:" + port);
});