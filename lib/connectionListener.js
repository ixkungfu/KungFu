var FreeList = require('freelist').FreeList;
var assert = require('assert').ok;
var HTTPParser = require('./http_parser.js').HTTPParser;
var Response = require('./response.js').Response;

var parsers = new FreeList('parsers', 1000, function() {
    return new HTTPParser('request');
});

var debug = function() { 
    var isDebug = process.env.NODE_DEBUG && /http/.test(process.env.NODE_DEBUG);
    return isDebug ? function(x) { console.error('HTTP: %s', x); } 
        : function() {};

}();


function httpSocketSetup(socket) {
  // NOTE: be sure not to use ondrain elsewhere in this file!
  socket.ondrain = function() {
    if (socket._httpMessage) {
      socket._httpMessage.emit('drain');
    }
  };
}

function connectionListener(socket) {
  var self = this;
  var outgoing = [];
  var incoming = [];

  function abortIncoming() {
    while (incoming.length) {
      var req = incoming.shift();
      req.emit('aborted');
      req.emit('close');
    }
    // abort socket._httpMessage ?
  }

  debug('SERVER new http connection');

  httpSocketSetup(socket);

  socket.setTimeout(2 * 60 * 1000); // 2 minute timeout
  socket.addListener('timeout', function() {
    socket.destroy();
  });

  var parser = parsers.alloc();
  parser.reinitialize('request');
  parser.socket = socket;
  parser.incoming = null;

  socket.addListener('error', function(e) {
    self.emit('clientError', e);
  });

  socket.ondata = function(d, start, end) {
    var ret = parser.execute(d, start, end - start);
    if (ret instanceof Error) {
      debug('parse error');
      socket.destroy(ret);
    } else if (parser.incoming && parser.incoming.upgrade) {
      var bytesParsed = ret;
      socket.ondata = null;
      socket.onend = null;

      var req = parser.incoming;

      // This is start + byteParsed + 1 due to the error of getting \n
      // in the upgradeHead from the closing lines of the headers
      var upgradeHead = d.slice(start + bytesParsed + 1, end);

      if (self.listeners('upgrade').length) {
        self.emit('upgrade', req, req.socket, upgradeHead);
      } else {
        // Got upgrade header, but have no handler.
        socket.destroy();
      }
    }
  };

  socket.onend = function() {
    var ret = parser.finish();

    if (ret instanceof Error) {
      debug('parse error');
      socket.destroy(ret);
      return;
    }

    if (!self.httpAllowHalfOpen) {
      abortIncoming();
      if (socket.writable) socket.end();
    } else if (outgoing.length) {
      outgoing[outgoing.length - 1]._last = true;
    } else if (socket._httpMessage) {
      socket._httpMessage._last = true;
    } else {
      if (socket.writable) socket.end();
    }
  };

  socket.addListener('close', function() {
    debug('server socket close');
    // unref the parser for easy gc
    parsers.free(parser);

    abortIncoming();
  });

  // The following callback is issued after the headers have been read on a
  // new message. In this callback we setup the response object and pass it
  // to the user.
  parser.onIncoming = function(req, shouldKeepAlive) {
    incoming.push(req);

    var res = new Response(req);
    debug('server response shouldKeepAlive: ' + shouldKeepAlive);
    res.shouldKeepAlive = shouldKeepAlive;
    //@NOTE: 报错
    //DTRACE_HTTP_SERVER_REQUEST(req, socket);

    if (socket._httpMessage) {
      // There are already pending outgoing res, append.
      outgoing.push(res);
    } else {
      res.assignSocket(socket);
    }

    // When we're finished writing the response, check if this is the last
    // respose, if so destroy the socket.
    res.on('finish', function() {
      // Usually the first incoming element should be our request.  it may
      // be that in the case abortIncoming() was called that the incoming
      // array will be empty.
      assert(incoming.length == 0 || incoming[0] === req);

      incoming.shift();

      res.detachSocket(socket);

      if (res._last) {
        socket.destroySoon();
      } else {
        // start sending the next message
        var m = outgoing.shift();
        if (m) {
          m.assignSocket(socket);
        }
      }
    });

    if ('expect' in req.headers &&
        (req.httpVersionMajor == 1 && req.httpVersionMinor == 1) &&
        continueExpression.test(req.headers['expect'])) {
        res._expect_continue = true;
      if (self.listeners('checkContinue').length) {
        self.emit('checkContinue', req, res);
      } else {
        res.writeContinue();
        self.emit('request', req, res);
      }
    } else {
      self.emit('request', req, res);
    }
    return false; // Not a HEAD response. (Not even a response!)
  };
}

exports.connectionListener = connectionListener;
