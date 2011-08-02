var sys = require('sys');
var Server = require('../lib/http.js').Server;
var url = require('url');

var count = 0;

function handle(req, res, out) {
    console.log('Request times: ' + ++count);
    //console.log(req.constructor)
    //console.log(res.constructor)
    console.log('data: ');
    console.dir(req.getParams());
    console.log(req.method);
    console.log('---');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Connect ' + req.method)
    res.write('\nURL ' + req.url)
    res.end();
}

var app = new Server(handle);

app.get('/about', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Connect ' + req.method);
    res.write('\nURL ' + req.url);
    res.write('Hello World!');
    res.end();
});

app.listen(88);

sys.puts('Server running at http://127.0.0.1:88/');
