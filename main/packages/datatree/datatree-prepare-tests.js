dt = WtDataTree;
datatree;


var index = 0;

var setup = function () {
    index = Meteor.uuid();
    datatree = new dt.DataTree('test' + index);
    datatree.addMetaType('some', SomeMeta);
};

var teardown = function (next) {
    if (Meteor.isServer) {
        datatree._col.node.remove({});
        datatree._col.tag.remove({});
    }
    datatree = null;
    if (next)
        next();
};

SomeMeta = dt.Meta.extend({});


datatreeTest = function (name, cb) {
    Tinytest.addAsync(name, function (test, next) {
        var newNext = function () {
            teardown();
            next();
        };

        setup();
        datatree.onReady(function () {
            cb(test, newNext);
        });
    });

};
