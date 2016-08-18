module.exports = Data;


function Data(layer, params) {
    this.layer = layer;
    this.params = params === true ? {} : params;
    this.middleware = null;
    this.route = null;
    this.router = null;
}
