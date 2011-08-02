var inherits = require('util').inherits;
var parse = require('url').parse;
var Request = require('./request.js').Request;
var _HTTPParser = process.binding('http_parser').HTTPParser;

exports.HTTPParser = HTTPParser;

function HTTPParser(type) {
    var httpparser = new _HTTPParser(type);
    var parser = new Parser();
    for (var k in parser) {
        httpparser[k] = parser[k];
    }
    return httpparser;
}

function Parser() {}

Parser.prototype.onMessageBegin = function() {
    this.incoming = new Request(this.socket);
    this.field = null;
    this.value = null;
}

// Only servers will get URL events.
Parser.prototype.onURL = function(b, start, len) {
    var slice = b.toString('ascii', start, start + len);
    if (this.incoming.url) {
        this.incoming.url += slice;
    } else {
        // Almost always will branch here.
        this.incoming.url = slice;
    }
    var urlObj = parse(this.incoming.url);
    this.incoming.pathname = urlObj['pathname'];
}

Parser.prototype.onHeaderField = function(b, start, len) {
    var slice = b.toString('ascii', start, start + len).toLowerCase();
    if (this.value != undefined) {
        this.incoming._addHeaderLine(this.field, this.value);
        this.field = null;
        this.value = null;
    }
    if (this.field) {
        this.field += slice;
    } else {
        this.field = slice;
    }
}

Parser.prototype.onHeaderValue = function(b, start, len) {
    var slice = b.toString('ascii', start, start + len);
    if (this.value) {
        this.value += slice;
    } else {
        this.value = slice;
    }
}

Parser.prototype.onHeadersComplete = function(info) {
    if (this.field && (this.value != undefined)) {
        this.incoming._addHeaderLine(this.field, this.value);
        this.field = null;
        this.value = null;
    }

    this.incoming.httpVersionMajor = info.versionMajor;
    this.incoming.httpVersionMinor = info.versionMinor;
    this.incoming.httpVersion = info.versionMajor + '.' + info.versionMinor;

    if (info.method) {
        // server only
        this.incoming.method = info.method;
    } else {
        // client only
        this.incoming.statusCode = info.statusCode;
    }

    this.incoming.upgrade = info.upgrade;

    var isHeadResponse = false;

    if (!info.upgrade) {
        // For upgraded connections, we'll emit this after parser.execute
        // so that we can capture the first part of the new protocol
        isHeadResponse = this.onIncoming(this.incoming, info.shouldKeepAlive);
    }

    return isHeadResponse;
}

Parser.prototype.onBody = function(b, start, len) {
    // TODO body encoding?
    var slice = b.slice(start, start + len);
    if (this.incoming._decoder) {
        var string = this.incoming._decoder.write(slice);
        if (string.length) this.incoming.emit('data', string);
    } else {
        this.incoming.emit('data', slice);
    }
}

Parser.prototype.onMessageComplete = function() {
    this.incoming.complete = true;
    if (this.field && (this.value != undefined)) {
        this.incoming._addHeaderLine(this.field, this.value);
    }
    if (!this.incoming.upgrade) {
        // For upgraded connections, also emit this after parser.execute
        this.incoming.readable = false;
        this.incoming.emit('end');
    }
}
