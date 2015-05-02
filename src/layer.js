var EventEmitter = require("event_emitter"),
    pathToRegexp = require("path_to_regexp"),
    isString = require("is_string"),
    map = require("map"),

    filterParams = require("./utils/filter_params"),
    cleanPath = require("./utils/clean_path"),
    buildPath = require("./utils/build_path");


var LayerPrototype;


module.exports = Layer;


function Layer(path, parent, end) {

    EventEmitter.call(this, -1);

    this.construct(path, parent, end);
}
EventEmitter.extend(Layer);
LayerPrototype = Layer.prototype;

Layer.create = function(path, parent, end) {
    return (new Layer(path, parent, end));
};

LayerPrototype.construct = function(path, parent, end) {

    this.__parent = parent;
    this.__regexp = null;
    this.__params = [];

    this.__end = !!end;
    this.__relativePath = null;
    this.__path = null;

    this.setPath(isString(path) ? path : "/");

    return this;
};

LayerPrototype.destruct = function() {

    this.__parent = null;
    this.__regexp = null;
    this.__params = null;

    this.__end = null;
    this.__relativePath = null;
    this.__path = null;

    return this;
};

LayerPrototype.setPath = function(path) {

    this.__relativePath = cleanPath(path);
    this.__path = buildPath(this.__parent, this.__relativePath);
    this.compile();

    return this;
};

LayerPrototype.match = function(path) {

    return filterParams(this.__regexp, this.__params, path);
};

LayerPrototype.format = function() {

    return pathToRegexp.format(this.__path);
};

LayerPrototype.recompile = function() {

    return this.setPath(this.__relativePath);
};

LayerPrototype.compile = function() {

    this.__regexp = pathToRegexp(this.__path, this.__params, this.__end);
    return this;
};

LayerPrototype.toJSON = function(json) {
    json = json || {};

    json.path = this.__path;

    json.params = map(this.__params, function(param) {
        return param.toJSON();
    });

    return json;
};
