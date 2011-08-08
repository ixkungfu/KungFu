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

app.get('/info', function(req, res) {
    console.log('Request times: ' + ++count);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Connect ' + req.method);
    res.write('\nURL ' + req.url);
    res.write('\nHello World!');
    res.end();
});

app.get(/^\/list/i, function(req, res) {
    console.log('Request times: ' + ++count);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('list list list!');
    res.end();
});

app.get('/about', function(req, res) {
    console.log('Request times: ' + ++count);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Connect ' + req.method);
    res.write('\nURL ' + req.url);
    res.write('\nAbount Me');
    res.end();
});

app.post('/entry', function(req, res) {
    console.log('Request times: ' + ++count);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Connect ' + req.method);
    res.write('\nURL ' + req.url);
    res.write('\nHello World!');
    res.write('\n<pre>' + JSON.stringify(req.getParams()) + '</pre>')
    res.end();
});

app.listen(8000);

sys.puts('Server running at http://127.0.0.1:8000/');
