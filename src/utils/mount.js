var isObject = require("@nathanfaucett/is_object"),
    isFunction = require("@nathanfaucett/is_function"),
    arrayForEach = require("@nathanfaucett/array-for_each");


module.exports = mount;


function mount(stack, handlers) {
    arrayForEach(handlers, function(handler) {
        var mw;

        if (isFunction(handler)) {
            stack[stack.length] = handler;
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                mw = handler.middleware;

                if (mw.length >= 3) {
                    stack[stack.length] = function(err, ctx, next) {
                        handler.middleware(err, ctx, next);
                    };
                } else if (mw.length <= 2) {
                    stack[stack.length] = function(ctx, next) {
                        handler.middleware(ctx, next);
                    };
                } else {
                    throw new Error("handler middleware invalid arguments, handler([err ,]ctx, next");
                }
            } else {
                throw new Error("handler.middleware must be a function");
            }
        } else {
            throw new Error("handlers must be functions or objects with a middleware function");
        }
    });
}
