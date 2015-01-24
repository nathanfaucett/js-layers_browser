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
                    next();
                }
            );

            router.handler({
                    pathname: "/parent/1/child/1.json",
                    url: "http://localhost:8888/parent/1/child/1.json"
                },
                function() {
                    assert.equal(calledMiddleware, true);
                    assert.equal(calledRoute, true);
                }
            );
        });
    });
});
