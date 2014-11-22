"use strict";

module.exports = DbQueryFormatter;

function DbQueryFormatter(dbApi) {
	this._dbApi = dbApi;
}

DbQueryFormatter.prototype.formatQuery = function(queryString, queryParameters) {
	return this._dbApi.format(queryString, queryParameters);
}