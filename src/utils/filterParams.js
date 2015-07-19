var parseURIComponent = require("./parseURIComponent"),
    isNullOrUndefined = require("is_null_or_undefined");


module.exports = filterParams;


function filterParams(regexp, params, path) {
    var ctxults = regexp.exec(path),
        filteredParams, ctxult, i, il, length;

    if (!ctxults) {
        return false;
    } else {
        filteredParams = {};

        il = params.length;
        if (il === 0) {
            return filteredParams;
        }

        i = -1;
        il = il - 1;
        length = ctxults.length;

        while (i++ < il) {
            if (i < length) {
                ctxult = ctxults[i + 1];

                if (!isNullOrUndefined(ctxult)) {
                    filteredParams[params[i].name] = parseURIComponent(ctxult);
                }
            }
        }

        return filteredParams;
    }
}
