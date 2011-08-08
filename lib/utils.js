/**
 * Is a given value a boolean
 * @param {Object} o
 * @return {Boolean}
 * @api public
 */
var isBoolean = exports.isBoolean = function(o) {
    //return true === o || false === o;
    return typeof o === 'boolean';
}

/**
 * Is a given value a null
 * @param {Null} o
 * @return {Boolean}
 * @api public
 */
var isNull = exports.isNull = function(o) {
    return o === null;
}

/**
 * Is a given variable undefined
 * @param {Undefined} o
 * @return {Boolean}
 * @api public
 */
var isUndefined = exports.isUndefined = function(o) {
    //return o === void 0;
    return typeof o === 'undefined';
}

/**
 * Is a given value a number
 * @param {Number} o
 * @return {Boolean}
 * @api public
 */
var isNumber = exports.isNumber = function(o) {
    return typeof o === 'number'  && isFinite(o);
}

/**
 * Is a given value a string
 * @param {String} o
 * @return
 * @api public
 */
var isString = exports.isString = function(o) {
    return typeof o === 'string';
}

/**
 * Is a giver variable array
 * @param {Array} o
 * @return {Boolean}
 * @api public
 */
var isArray = exports.isArray = Array.isArray || function(o) {
    //return Object.prototype.toString.call(o) == '[object Array]';
    return {}.toString.call(o) == '[object Array]';
}

/**
 * Is a giver variable object
 * @param {Object} o
 * @return {Boolean}
 * @api public
 */
var isObject = exports.isObject = function(o, failfn) {
    return {}.toString.call(o) == '[object Object]';
}

/**
 * Is a giver variable function.
 * @param {Function} o
 * @return {Boolean}
 * @api public
 */
var isFunction = exports.isFunction = function(o) {
    return {}.toString.call(o) == '[object Function]';
}

/**
 * Object instanceof 
 * @param {Object} o
 * @param {Function|Object} type
 */
var instanceOf = exports.instanceOf = function(o, type) {
    return (o && o.hasOwnProperty && (o instanceof type));
}

/**
 * Return the current time in milliseconds.
 * @return {Number}
 */
var now = exports.now = Date.now || function() {
    //return new Date().getTime();
    return +new Date();
}

/**
 * Return a random int.
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api public
 */
var getRandomInt = exports.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * A empty function.
 */
var noop = exports.noop = function() {}

/**
 * Convert object to array
 * @param {Object} o
 * @return {Array}
 */
var toArray = exports.toArray = (function(s) {
    return function(o) {
        return s.call(o, 0);
    }
})(Array.prototype.slice);
