var http = require('http')
  , ServerResponse = http.ServerResponse
  , inherits = require('util').inherits;

var Response = exports.Response = function Response(request) {
    ServerResponse.call(this, request);
}

inherits(Response, ServerResponse);
