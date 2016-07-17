var isArray = require("@nathanfaucett/is_array"),
    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),
    LayerData = require("./LayerData"),
    Layer = require("./Layer");


var RoutePrototype;


module.exports = Route;


function Route(path, parent, end) {

    Layer.call(this, path, parent, end);

    this.__stack = [];
    this.__isMiddleware__ = false;
}
Layer.extend(Route);
RoutePrototype = Route.prototype;

Route.create = function(path, parent, end) {
    return new Route(path, parent, end);
};

RoutePrototype.__isRoute__ = true;

RoutePrototype.enqueue = function(queue, parentData /*, pathname */ ) {
    var stack = this.__stack,
        i = -1,
        il = stack.length - 1;

    while (i++ < il) {
        queue[queue.length] = new LayerData(stack[i], parentData);
    }
};

RoutePrototype.mount = function(handlers) {
    mount(this.__stack, isArray(handlers) ? handlers : arguments);
    return this;
};

RoutePrototype.unmount = function(handlers) {
    unmount(this.__stack, isArray(handlers) ? handlers : arguments);
    return this;
};
