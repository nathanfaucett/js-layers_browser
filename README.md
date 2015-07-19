layers_browser
=======

layers for the browser and node.js

```javascript
var layers = require("layers_browser");


var router = new layers.Router(), // layers.Router.create()

    // create new router layer under the "/posts" path
    posts = router.scope("posts");


// can be a object with a middleware function
router.use(
    function middleware(req, res, next) {
        // cors middleware
    }
);

router.route( // same as "/"
    function home(req, res, next) {
        // render home stuff
        next();
    }
);

posts.use(
    function middleware(req, res, next) {
        // do some work on "/posts/**"
    }
);

posts.route( // "/posts"
    function signIn(req, res, next) {
        // return user if signed in
        next();
    }
);

posts.route("/:id[0-9]", // "/posts/:id[0-9]"
    function signIn(req, res, next) {
        // sign user in
        next();
    }
);


```
