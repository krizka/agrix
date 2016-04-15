NodeMixin = NodeMixin || {}; // client mixins

WtDataTree.Node = WtDataTree.Meta.extend({
    //_dt: DataTree;
    //_data: NodeJson;
    //_meta: Meta[];

    fromData(datatree, data) {
        data._t = 'node';
        WtDataTree.Meta.super('fromData', this, this, data);

        this._sub = 0;
        this._dt = datatree;
    },

    // node default name
    name(name, cb) {
        if (_.isString(name)) {
            this._data.n = name;
            if (cb) cb();
        }

        return this._data.n;
    },

    _updateData(newData) {
        // count data revision
        if (newData.r > this._data.r) {
            this._data = newData;
        }
    },

    /**
     * Get cursor to observer root changes
     * @returns {Meteor.Cursor}
     */
    selfCursor() {
        return this._dt.find(this.id());
    },

    subscribeChildren(cb) {
        this._sub++;
        this._dt.subscribeChildren(this.id(), {
            onReady() {
                cb && cb();
            },
            onStop() {
                self._sub--;
            }
        });
    },
    /** get cursor of all children nodes
     *
     * @returns {Meteor.Cursor}
     */
    findChildren(query, options) {
        var q = { p: this.id() };

        if (query)
            q = _.defaults(q, query);

        return this._dt.find(q, options);
    },

//    /** get all children
//     *
//     * @returns {WtDataTree.Node[]}
//     */
//    children(callback) {
//        if (Meteor.isClient) // callback must be a function on the client
//            check(callback, Function);
//
//        var res;
//
//        if (!this.hasChildren()) {
//            res = [];
//            callback(res);
//            return res;
//        }
//
//        if (Meteor.isServer) {
//            this.childrenCursor({}, function (cursor) {
//                res = cursor.fetch();
//                if (callback)
//                    callback(res);
//            });
//            return res;
//        } else {
//            return this.childrenCursor({}, function (cursor) {
//                callback(cursor.fetch());
//            });
//        }
//    },

    /** is node have any child
     * @returns {boolean}
     */
    hasChildren() {
        return this._data.c;
    },

    /** get cursor of all parent nodes
     *
     * @returns {Meteor.Cursor}
     */
    findParent() {
        return this._dt.find({ _id: { $in: this._data.p } });
    },

    /** get parents count
     *
     * @returns {number}
     */
    parentsCount() {
        var p = this._data.p;
        return p ? p.length : 0;

    },

    /** get all parents
     *
     * @returns {WtDataTree.Node[]}
     */
    parents() {
        if (this.parentsCount() > 0) {
            return this.findParent().fetch();
        } else {
            return [];
        }
    },

    /**
     * Create new child to node
     * @param {String} name - new node name
     * @param {WtDataTree.Tag[]} tags
     * @param {Function} cb -
     * @returns {WtDataTree.Node}
     */
    createChild(name, tags, cb) {
        check(name, String);

        if (_.isFunction(tags)) {
            cb = tags;
            tags = undefined;
        }

        var parentId = this.id();
        var childId = this._dt.call('createChild', parentId, name, tags, cb);
        return this._dt.findOne(childId);
    },
    /**
     * Add new childId to node
     * @param {WtDataTree.Node} childId
     * @param {Function} cb
     */
    addChild(childId, cb) {
        check(childId, String);

        this._dt.call('addChild', this.id(), childId, cb);
    },

    /**
     * Save node changes
     */
    save(cb) {
        this._dt.call('save', this._data, cb);
    },

    equals(other) {
        return other instanceof WtDataTree.Node && other.id().equals(this.id());
    },

    /**
     * Remove child from node
     * @param {String} childId
     * @param {Function} cb - callback will be called when child node and maybe some its subtree will be removed
     */
    removeChild(childId, cb) {
        check(childId, String);

        this._dt.call('removeChild', this.id(), childId, cb);
    },

    move(srcId, dstId, cb) {
        check(srcId, String);
        check(dstId, String);

        this._dt.call('changeParent', this.id(), srcId, dstId, cb);
    },

    /**
     * Test if we can add child to this node
     * @param {WtDataTree.Node} child to test for addition
     * @returns {boolean}
     */
    canAddChild(child) {
        check(child, WtDataTree.Node);

        return child._data.p !== null && child.id() != this.id();
    },

    /**
     * Test if we can remove child from this node
     * @param {WtDataTree.Node} child to test for removal
     * @return {boolean} true if we can remove child from this node
     */
    canRemoveChild(child) {
        check(child, WtDataTree.Node);

        return _.contains(child._data.p, this.id());
    }
})
    .mixin(WtDataTree.TagsProto)
    .mixin(NodeMixin);
