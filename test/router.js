var assert = require("assert"),
    layers = require("../src/index");


describe("#Router", function() {

    describe("#handler(ctx : Object[, callback(err : Error, ctx) : Function])", function() {
        it("should call all routes/middleware based on ctx.pathname or url.parse(ctx.url).pathname", function() {
            var router = layers.Router.create(),

                calledMiddleware = false,
                calledRoute = false;

            router.use(
                function(ctx, next) {
                    next();
                },
                function(ctx, next) {
                    calledMiddleware = true;
                    next();
                }
            );

            router.route("/parent/:parent_id[0-9]/child/:id[0-9](.:format)",
                function(ctx, next) {
                    next();
                },
                function(ctx, next) {
                    calledRoute = true;
                    ctx.end();
                    next();
                }
            );

            router.use(
                function(ctx, next) {
                    if (ctx.route) {
                        next();
                    } else {
                        next(new Error("404 - Not Found"));
                    }
                }
            );

            router.handler({
                    pathname: "/parent/1/child/1.json",
                    url: "http://localhost:8888/parent/1/child/1.json"
                },
                function(err) {
                    assert.equal(err, undefined);
                    assert.equal(calledMiddleware, true);
                    assert.equal(calledRoute, true);
                }
            );

            router.handler({
                    pathname: "/not_found",
                    url: "http://localhost:8888/not_found"
                },
                function(err) {
                    assert.equal(err.message, "404 - Not Found");
                }
            );
        });
    });
});
