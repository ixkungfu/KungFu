var http = require('http')
  , IncomingMessage = http.IncomingMessage
  , inherits = require('util').inherits
  , parse = require('url').parse;

var Request = exports.Request = function Request(socket) {
    IncomingMessage.call(this);
}

inherits(Request, IncomingMessage);

Request.prototype.pathname = '/';

Request.prototype.__data = '';

Request.prototype._data = {};

Request.prototype.getMethod = function() {
    return this.method;
}

Request.prototype.getResourceUri = function() {
    return parse(this.url).pathname;
}

Request.prototype.getParams = function() {
    return this._data = parse(this.__data);
}
