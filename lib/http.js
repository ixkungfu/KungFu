/**
 * Module dependencies.
 */
var net = require('net');
var connectionListener = require('./connectionListener.js').connectionListener;
var Router = require('./router.js').Router;

exports.Server = Server;

function Server(requestListener) {
    if (!(this instanceof Server)) return new Server(requestListener);

    net.Server.call(this, { allowHalfOpen: true });

    if (requestListener) {
        this.addListener('request', this.createHandle(requestListener));
    }

    this.httpAllowHalfOpen = false;

    this.addListener('connection', connectionListener);
}

Server.prototype.__proto__ = net.Server.prototype;

Server.prototype.createHandle =  function(requestListener) {

    var self = this;

    return function(req, res, out) {

        var method = req.method.toLowerCase();

        req.setEncoding('utf8');

        req.on('data', function(chunk){
            req.__data += chunk;
            req.getParams(chunk, req._data);
        });

        req.on('end', function(){

            if (self.routers[method].hasOwnProperty(req.pathname)) {
                return self.routers[method][req.pathname].call(self, req, res, out);
            }

            return requestListener.call(this, req, res, out);
        });

        if ('get' === method) {
            return requestListener.call(this, req, res, out);
        }
    }
}

Server.prototype.routers = {
    'get': {},
    'post': {},
    'put': {},
    'delete': {}
};

Server.prototype.get = function(pattern, callback) {
    if (!this.routers['get'].hasOwnProperty(pattern)) {
        this.routers['get'][pattern.toString()] = callback;
    }
}

Server.prototype.post = function(pattern, callback) {
    if (!this.routers['post'].hasOwnProperty(pattern)) {
        this.routers['post'][pattern.toString()] = callback;
    }
}
