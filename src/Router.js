var isFunction = require("is_function"),
    isObject = require("is_object"),
    isString = require("is_string"),
    indexOf = require("index_of"),
    forEach = require("for_each"),
    fastSlice = require("fast_slice"),
    urls = require("urls"),
    HttpError = require("http_error"),

    cleanPath = require("./utils/cleanPath"),
    Data = require("./Data"),
    Route = require("./Route"),
    Layer = require("./Layer");


var LayerPrototype = Layer.prototype;


module.exports = Router;


function Router(path, parent) {
    Layer.call(this, path, parent, false);
}
Layer.extend(Router);

Router.create = function(path, parent) {
    return new Router(path, parent);
};

Router.prototype.__isRouter__ = true;

Router.prototype.construct = function(path, parent) {

    this.__layers = [];

    this.Route = Route;
    this.Middleware = Route;
    this.Scope = Router;

    LayerPrototype.construct.call(this, path, parent, false);

    return this;
};

Router.prototype.destructor = function() {

    LayerPrototype.destructor.call(this);

    this.__layers = null;

    this.Route = null;
    this.Middleware = null;
    this.Scope = null;

    return this;
};

Router.prototype.enqueue = function(queue, parentData, pathname) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1,
        layer, params, data;

    while (i++ < il) {
        layer = layers[i];

        if ((params = layer.match(pathname))) {
            data = new Data(layer, params);

            if (layer.__isRouter__) {
                data.router = layer;
                layer.enqueue(queue, data, pathname);
            } else {
                if (layer.__isMiddleware__) {
                    data.middleware = layer;
                } else {
                    data.route = layer;
                }
                layer.enqueue(queue, data, pathname);
            }
        }
    }
};

function Router_final(_this, ctx, error, callback) {
    if (ctx.forceEnd && !error) {
        if (isFunction(callback)) {
            callback(undefined, ctx);
        }
        _this.emit("end", undefined, ctx);
    } else {
        error = error || new HttpError(404);
        ctx.statusCode = error.statusCode || error.status || error.code || 500;

        if (isFunction(callback)) {
            callback(error, ctx);
        } else {
            console.error(error);
        }
        _this.emit("end", error, ctx);
    }
}

function end() {
    this.forceEnd = true;
    return this;
}

Router.prototype.handler = function(ctx, callback) {
    var _this = this,
        queue = [],
        pathname = ctx.pathname || (ctx.pathname = urls.parse(ctx.url).pathname),
        index = 0,
        queueLength;

    ctx.end = end;
    ctx.forceEnd = false;

    this.enqueue(queue, null, pathname);
    queueLength = queue.length;

    (function next(error) {
        var layer, fn, data, length;

        if (ctx.forceEnd || index >= queueLength) {
            Router_final(_this, ctx, error, callback);
        } else {
            layer = queue[index++];
            fn = layer.fn;
            length = fn.length;
            data = layer.data;

            ctx.params = data.params;
            ctx.layer = data.layer;
            ctx.middleware = data.middleware;
            ctx.route = data.route;
            ctx.next = next;

            try {
                if (length >= 3) {
                    fn(error, ctx, next);
                } else {
                    if (!error) {
                        fn(ctx, next);
                    } else {
                        next(error);
                    }
                }
            } catch (e) {
                next(e);
            }
        }
    }());
};

Router.prototype.find = function(path, type) {
    var layers = this.__layers,
        i = layers.length,
        layer;

    type = type || "route";
    path = cleanPath(path);

    while (i--) {
        layer = layers[i];

        if (!layer || path.indexOf(layer.__path) === -1) {
            continue;
        } else if (type === "middleware" && layer.__isMiddleware__) {
            return layer;
        } else if (type === "route" && layer.__isRoute__) {
            return layer;
        } else if (layer.__isRouter__) {
            if (type === "scope" || type === "router") {
                return layer;
            } else {
                return layer.find(path, type);
            }
        }
    }

    return undefined;
};

Router.prototype.setPath = function(path) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1;

    LayerPrototype.setPath.call(this, path);

    while (i++ < il) {
        layers[i].recompile();
    }

    return this;
};

Router.prototype.unmount = function(path, type) {
    var layer = this.find(path, type || (type = "route")),
        scope, layers, index;

    if (layer) {
        scope = layer.parent || this;
        layers = scope.layers;

        if ((index = indexOf(layers, layer))) {
            layers.splice(index, 1);
        }
    } else {
        throw new Error("Router.unmount(path[, type]) no layer found with type " + type + " at path " + path);
    }

    return this;
};

Router.prototype.use = function(path) {
    var _this = this,
        layers = this.__layers,
        middleware, middlewareStack, stack;

    if (isString(path)) {
        stack = fastSlice(arguments, 1);
    } else {
        stack = fastSlice(arguments);
        path = "/";
    }

    middlewareStack = [];

    forEach(stack, function(handler) {
        var mw;

        if (isFunction(handler)) {
            middlewareStack[middlewareStack.length] = handler;
        } else if (handler.__isRouter__) {
            _this.scope(handler);
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                mw = handler.middleware;

                if (mw.length >= 3) {
                    middlewareStack[middlewareStack.length] = function(err, ctx, next) {
                        handler.middleware(err, ctx, next);
                    };
                } else {
                    middlewareStack[middlewareStack.length] = function(ctx, next) {
                        handler.middleware(ctx, next);
                    };
                }
            } else {
                throw new Error("use(handlers...) handler middleware must be a function");
            }
        } else {
            throw new Error("use(handlers...) handlers must be functions or objects with a middleware function");
        }
    });

    if (middlewareStack.length !== 0) {
        middleware = new this.Middleware(path, this, false);
        middleware.__isMiddleware__ = true;
        layers[layers.length] = middleware;
        middleware.mount(middlewareStack);
    }

    return this;
};

Router.prototype.route = function(path) {
    var layers = this.__layers,
        route, stack;

    if (isString(path)) {
        stack = fastSlice(arguments, 1);
    } else {
        stack = fastSlice(arguments);
        path = "/";
    }

    route = new this.Route(path, this, true);
    layers[layers.length] = route;

    if (stack.length !== 0) {
        layers[layers.length] = route;
        route.mount(stack);
    }

    return route;
};

Router.prototype.scope = function(path) {
    var layers = this.__layers,
        router;

    if (path.__isRouter__) {
        router = path;
        path = router.__relativePath;

        router.__parent = this;
        router.setPath(path);

        if (indexOf(this.__layers, router) !== -1) {
            return router;
        }
    } else {
        path = cleanPath(path);
    }

    if (!router) {
        router = new this.Scope(path, this);
        router.Route = this.Route;
        router.Middleware = this.Middleware;
        router.Scope = this.Scope;
    }

    layers[layers.length] = router;

    return router;
};
