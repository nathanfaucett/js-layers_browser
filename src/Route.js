var isArray = require("is_array"),
    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),
    LayerData = require("./LayerData"),
    Layer = require("./Layer");


var LayerPrototype = Layer.prototype;


module.exports = Route;


function Route(path, parent, end) {
    Layer.call(this, path, parent, end);
}
Layer.extend(Route);

Route.create = function(path, parent, end) {
    return new Route(path, parent, end);
};

Route.prototype.__isRoute__ = true;

Route.prototype.construct = function(path, parent, end) {

    LayerPrototype.construct.call(this, path, parent, end);

    this.__stack = [];
    this.__isMiddleware__ = false;

    return this;
};

Route.prototype.destructor = function() {

    LayerPrototype.destructor.call(this);

    this.__stack = null;

    return this;
};

Route.prototype.enqueue = function(queue, parentData /*, pathname */ ) {
    var stack = this.__stack,
        i = -1,
        il = stack.length - 1;

    while (i++ < il) {
        queue[queue.length] = new LayerData(stack[i], parentData);
    }
};

Route.prototype.mount = function(handlers) {
    mount(this.__stack, isArray(handlers) ? handlers : arguments);
    return this;
};

Route.prototype.unmount = function(handlers) {
    unmount(this.__stack, isArray(handlers) ? handlers : arguments);
    return this;
};
