var Route = require('./route').Route;

var _methods = exports.methods = [
    'get'
  , 'post'
  , 'put'
  , 'delete'
  , 'connect'
  , 'options'
  , 'trace'
  , 'copy'
  , 'lock'
  , 'mkcol'
  , 'move'
  , 'propfind'
  , 'proppatch'
  , 'unlock'
  , 'report'
  , 'mkactivity'
  , 'checkout'
  , 'merge'
];

exports.Router = Router;

function Router() {
}

Router.prototype = {
    request: null,
    setRequest: function(req) {
        this.request = req; 
    },
    map: function(pattern, callback, method) {
        var route = new Route(pattern, callback);
        route.setRouter(this);
        this.routes[method][pattern] = route;
        return route;
    },
    routes: {},
    matchedRoutes: {},
    getMatchedRoutes: function(reload) {
        var method = this.request.getMethod().toLowerCase();
        var uri = this.request.getResourceUri();
        this.matchedRoutes[method] = {};

        for (var pattern in this.routes[method]) {
            var route = this.routes[method][pattern];
            if (route.matches(uri)) {
                this.matchedRoutes[method][pattern] = route;
            }
        }

        return this.matchedRoutes[method];
    }
};

!function(R, m) {
   m.forEach(function(v, i){
       R.prototype.routes[v] = {};
   });
}(Router, _methods);
