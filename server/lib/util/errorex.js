var inherits = require('inherits');

module.exports = ErrorEx;

inherits(ErrorEx, Error);
function ErrorEx(message, name, wrappedError) {
	Error.call(this, message);
	this.name = name;
	this.wrappedError = wrappedError;
}
