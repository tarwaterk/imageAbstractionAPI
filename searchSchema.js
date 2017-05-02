var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var QuerySchema = new Schema({
	query: String,
	date: Date
});

var SearchQuery = mongoose.model("query", QuerySchema);

module.exports = SearchQuery;