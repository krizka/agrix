/**
 * Created by kriz on 15.07.15.
 */

var dt = WtDataTree = {};

dt._initData = {
    p: null, // no parent
    c: false,
    r: 0, // 0 revision
    _t: 'node'
};
dt._rootData = { // how to find root
    p: null // no parent
};

dt._collections = {};

dt.Collection = function (name, opt) {
    return dt._collections[name] || ( dt._collections[name] = new Mongo.Collection(name, opt) );
};

dt._dts = {};
