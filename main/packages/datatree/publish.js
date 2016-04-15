/**
 * Created by kriz on 29.11.14.
 */


var publishNodeCursor = function (dt, cursor, onlyTypes) {
    var nN = dt._name + 'Nodes';
    var mN = dt._name + 'Metas';
    var self = this;

    var nodes;
    if (onlyTypes)
        nodes = this.connection.onlyNodes = this.connection.onlyNodes || {};
    else
        nodes = this.connection.nodes = this.connection.nodes || {};

    var added = function (nodeId, nodeData) {
        // first send node without meta data then send all the metadata
        var m = nodeData.m;
        delete nodeData.m;

        self.added(nN, nodeId, nodeData);

        // second send all the metas, with _n as node id
        var metas = [];
        _.each(m, function (metaData) {
            if (onlyTypes && !_.contains(onlyTypes, metaData._t))
                return;

            metaData._n = nodeId;
            metaData._p = nodeData.p;

            //console.log('adding meta', metaData._id, metaData._t, metaData.r);
            self.added(mN, metaData._id, metaData);
            metas.push({ _id: metaData._id, r: metaData.r });
        });
        nodes[nodeId] = metas;
    };

    cursor.forEach(function (doc) {
        added(doc._id, doc);
    });

    var changes = cursor.observeChanges({
        added: added,

        changed(nodeId, nodeData) {
            // first send node without meta data then send all the metadata
            var m = nodeData.m;
            delete nodeData.m;

            if (!_.isEmpty(nodeData)) {
                self.changed(nN, nodeId, nodeData);
            }
            var oldMetas = nodes[nodeId] || []; // TODO check when it can be undefined
            var newMetas = [];
            if (!_.isEmpty(m)) {
                for (var i = 0; i < m.length; i++) {
                    var metaData = m[i];
                    if (onlyTypes && !_.contains(onlyTypes, metaData._t))
                        continue;

                    metaData._n = nodeId;
                    // find each meta in old
                    var oldMeta = null;
                    for (var oldI = 0; oldI < oldMetas.length; oldI++) {
                        oldMeta = oldMetas[oldI];
                        if (oldMeta && oldMeta._id === metaData._id)
                            break;

                        oldMeta = null;
                    }

                    if (oldMeta) {
                        oldMetas.splice(oldI, 1);
                        if (oldMeta.r < metaData.r) {
                            self.changed(mN, metaData._id, metaData);
                            //console.log('updating meta', metaData._id, metaData._t, metaData.r);
                        }
                    } else {
                        //console.log('adding meta', metaData._id, metaData._t, metaData.r);
                        self.added(mN, metaData._id, metaData);
                    }

                    newMetas.push({ _id: metaData._id, r: metaData.r });
                }
            }
            // now in node we have an array of removed metas
            _.each(oldMetas, function (meta) {
                //console.log('removing meta', metaData._id, metaData._t, metaData.r);
                self.removed(mN, meta._id);
            });

            nodes[nodeId] = newMetas;
        },

        removed(nodeId) {
            // first remove metas
            _.each(nodes[nodeId], function (meta) {
                self.removed(mN, meta._id);
            });

            // first remove node
            self.removed(nN, nodeId);

            delete nodes[nodeId];
        }
    });

    this.onStop(function () {
        changes.stop();
    });

    this.ready();
};

DataTreeInit = class DataTreeInit {
    //_name: string;
    //_treeCol: Mongo.Collection;
    //_tagsCol: Mongo.Collection;

    _initData() {
        if (this._col.node.find(WtDataTree._rootData).count() == 0)
            this._col.node.insert(WtDataTree._initData);

        this.initPublish();

        delete this._needInit;

        this._onReady();
    }


    initPublish() {
        var dt = this;

        Meteor.publish(this._name + 'Id', function (id) {
            check(id, String);
            publishNodeCursor.call(this, dt, dt._col.node.find({ _id: id }));
        });

        Meteor.publish(this._name + 'C', function (parentId) {
            check(parentId, String);
            publishNodeCursor.call(this, dt, dt._col.node.find({ p: parentId }));
        });

        // autopublish root and immediates
        Meteor.publish(this._name + 'Init', function () {
            publishNodeCursor.call(this, dt, dt._col.node.find(WtDataTree._rootData));

            return dt._col.tag.find({});
        });

        Meteor.publish(this._name + 'Immediates', function () {
            var immediates = [];
            _.each(dt._metaTypes, function (mt, name) {
                if (_.isFunction(mt.prototype.immediate))
                    immediates.push(name);
            });

            var cursor = dt._col.node.find({ 'm._t': { $in: immediates } });

            publishNodeCursor.call(this, dt, cursor, immediates);
        });
    }

    call(method /* args */) {
//        var args;
//        if (!_.isFunction(callback)) {
//            args = _.args(arguments, 1);
//            callback = undefined;
//        } else {
//            args = _.args(arguments, 1, -1);
//        }
//
//        args.unshift(this);
        arguments[0] = this._prefix + method;

        try {
//            var result = DataTreeMethods[method].apply(null, args);
//            if (callback) {
//                callback(undefined, result);
//            }
//            return result;
            return Meteor.call.apply(Meteor, arguments);
        } catch (e) {
            var callback = _.last(arguments);
            if (_.isFunction(callback)) {
                callback(e);
            } else {
                console.error('Error while calling server method ' + method, e);
            }
            throw e;
        }
    }
}

if (WtUtils.isDevelopmentMode()) {
    Meteor.methods({
        DT_create(name) {
            new WtDataTree.DataTree(name);
        }
    });
}


//==============================================================
// Methods
//==============================================================

/** Singleton, returning named data-tree
 * return created datatree */
WtDataTree.Dt = function (name) {
    if (WtUtils.isDevelopmentMode()) {
        return WtDataTree._dts[name] = WtDataTree._dts[name] || new WtDataTree.DataTree(name);
    }

    if (!WtDataTree._dts[name])
        throw new Meteor.Error(404, 'datatree not found ' + name);

    return WtDataTree._dts[name];
};
