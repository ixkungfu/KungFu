/**
 * Module dependencies.
 */
var net = require('net');
var connectionListener = require('./connectionListener').connectionListener;
var Router = require('./router').Router;
var methods = require('./router').methods;
var toArray = require('./utils').toArray;

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

    var router = self.router = new Router();

    return function(req, res, out) {

        var method = req.method.toLowerCase();

        if (router) {
            router.setRequest(req);
        }

        req.setEncoding('utf8');

        req.on('data', function(chunk){
            req.__data += chunk;
            req.getParams(chunk, req._data);
        });

        req.on('end', function(){

            try {
                var routes = router.getMatchedRoutes();
                var dispatched = false;
                for (var p in routes) {
                    try {
                        dispatched = routes[p].dispatch(req, res, out);
                        if (dispatched) {
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (!dispatched) {
                    self.notFound(res);
                }

            } catch (e) {
            }

        });

    }
}

Server.prototype.notFound = function(res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('404, Page not found.');
    res.end();
}

Server.prototype.router = null;

Server.prototype.mapRoute = function(method, args) {
    var pattern = args.shift(), callback = args.pop();
    var route = this.router.map(pattern, callback, method);
    return route;
}

//-function(S, m) { // broken
!function(S, m) {
   m.forEach(function(v, i){

       S.prototype[v] = function() {
           return this.mapRoute(v, toArray(arguments));
       }

   });
}(Server, methods);
