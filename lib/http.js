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
    return function(req, res, out) {

        var method = req.method.toLowerCase();

        req.setEncoding('utf8');

        if (this.routers[method].hasOwnProperty(req.pathname)) {
            console.log('Route ...')
            return this.routers[method][req.pathname].call(this, req, res, out);
        }

        if ('get' === method) {
            return requestListener.call(this, req, res, out);
        }

        req.on('data', function(chunk){
            req.__data += chunk;
            req.getParams(chunk, req._data);
        });

        req.on('end', function(){
            return requestListener.call(this, req, res, out);
        });
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
}
