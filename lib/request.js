var http = require('http')
  , IncomingMessage = http.IncomingMessage
  , inherits = require('util').inherits
  , parse = require('querystring').parse;

var Request = exports.Request = function Request(socket) {
    IncomingMessage.call(this);
}

inherits(Request, IncomingMessage);

Request.prototype.pathname = '';

Request.prototype.__data = '';

Request.prototype._data = {};

Request.prototype.getParams = function() {
    return this._data = parse(this.__data);
}
