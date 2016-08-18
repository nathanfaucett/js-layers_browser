var tape = require("tape"),
    layers = require("../src/index");


tape("#Router handler(ctx : Request, ctx : Response[, callback(err : Error, ctx) : Function])", function(assert) {
    var router = layers.Router.create(),
        calledMiddleware = false,
        calledScopedRoute = false,
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

    router.route("/parent/:parent_id{[0-9]+}/child/:id{[0-9]+}(.:format)",
        function(ctx, next) {
            next();
        },
        function(ctx, next) {
            calledRoute = true;
            next();
        }
    );

    router.scope("/parent/:parent_id{[0-9]+}")
        .route("/child/:id{[0-9]+}(.:format)",
            function(ctx, next) {
                assert.equal(ctx.params.parent_id, "1");
                assert.equal(ctx.params.id, "1");
                calledScopedRoute = true;
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
            url: "http://localhost:9999/parent/1/child/1.json"
        },
        function() {
            assert.equal(calledMiddleware, true);
            assert.equal(calledScopedRoute, true);
            assert.equal(calledRoute, true);
        }
    );

    router.handler({
            pathname: "/not_found",
            url: "http://localhost:9999/not_found"
        },
        function(err) {
            assert.equal(err.message, "404 - Not Found");
        }
    );

    assert.end();
});
