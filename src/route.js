var isArray = require("is_array"),
    fastSlice = require("fast_slice"),
    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),
    Layer = require("./layer");


var LayerPrototype = Layer.prototype;


module.exports = Route;


function Route(path, parent, end) {
    Layer.call(this, path, parent, end);
}
Layer.extend(Route);

Route.create = function(path, parent, end) {
    return new Route(path, parent, end);
};

Route.prototype.construct = function(path, parent, end) {

    LayerPrototype.construct.call(this, path, parent, end);

    this.__stack = [];

    return this;
};

Route.prototype.destruct = function() {

    LayerPrototype.destruct.call(this);

    this.__stack = null;

    return this;
};

Route.prototype.__handle = function(err, ctx, next) {
    var stack = this.__stack,
        index = 0,
        stackLength = stack.length;

    if (!stack || !stackLength) {
        next(err);
    } else {
        (function done(err) {
            var handler, length;

            if (index >= stackLength) {
                next(err);
            } else {
                handler = stack[index++];
                length = handler.length;

                ctx.next = done;

                try {
                    if (length >= 3) {
                        handler(err, ctx, done);
                    } else {
                        if (!err) {
                            handler(ctx, done);
                        } else {
                            next(err);
                        }
                    }
                } catch (e) {
                    next(e);
                }
            }
        }(err));
    }
};

Route.prototype.mount = function(handlers) {

    mount(this.__stack, isArray(handlers) ? handlers : fastSlice(arguments));
    return this;
};

Route.prototype.unmount = function(handlers) {

    unmount(this.__stack, isArray(handlers) ? handlers : fastSlice(arguments));
    return this;
};
