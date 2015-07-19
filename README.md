layers
=======

layers for the browser and node.js

```javascript
var layers = require("layers");


var router = new layers.Router(), // layers.Router.create()

    // create new router layer under the "/sessions" path
    sessions = router.scope("sessions");


// can be a object with a middleware function
router.use(
    function cors(ctx, next) {
        // cors middleware
    },
    function bodyParser(ctx, next) {
        // body parser middleware
    }
);

router.route() // same as "/"
    .get(
        function getHome(ctx, next) {
            // send home info
            next();
        }
    );

sessions.use(
    function middleware(ctx, next) {
        // do some work on "/sessions/**"
    }
);

sessions.route("sign_in")
    .get(
        function signIn(ctx, next) {
            // return user if signed in
            next();
        }
    );

sessions.route("sign_up")
    .post(
        function signIn(ctx, next) {
            // sign user in
            next();
        }
    );


```
