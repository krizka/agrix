// Write your package code here!

//class TaggableJson {
//    _ta: string[];
//}
//
//class MetaJson implements TaggableJson {
//    _id: string;
//    _t: string; // type
//    _ta: string[];
//}
//
//class NodeJson implements TaggableJson {
//    _id: string;
//    _ta: string[]; // tags
//    p: string[]; // parents
//    m: MetaJson[]; // metas
//    b: boolean; // is branch and has children
//}
//
//class TagJson {
//    _id: string;
//    name: string;
//}

var tryWrapTransform = function (func) {
    return function (doc) {
        try {
            var x = func.call(this, doc);
            if (!x)
                console.log(func, doc);
            return x;
        } catch (e) {
            console.error(e, doc);
        }
    }
};

var createCache = function (dt, create) {
    var self = dt;
    return new WtUtils.WtCache({
        max: -1,
        //debug: WtUtils.isDevelopmentMode(),
        create(data) {
            return create ? create(data, self) : _.construct('fromData', self.getMetaType(data._t), self, data);
        },
        update(obj, data) {
            obj._updateData(data);
        }
    });
};

WtDataTree.DataTree = class DataTree extends DataTreeInit {
    //_name: string;
    //_col.node: Mongo.Collection;
    //_col.tag: Mongo.Collection;
    //_tags: Tag[];

    _initMethods() {
        var self = this;
        var namespaced = {};
        this._prefix = 'DT_' + self._name + '_';
        if (Meteor.isClient)
            this._methResult = undefined;

        _.each(DataTreeMethods, function (f, name) {
            if (Meteor.isClient) {
                namespaced[self._prefix + name] = function () {
                    var args = _.args(arguments);
                    args.unshift(self);
                    self._methResult = f.apply(this, args); // yes, this - is right, not self
                };
            } else {
                namespaced[self._prefix + name] = function () {
                    var args = _.args(arguments);
                    args.unshift(self);
                    return f.apply(this, args); // yes, this - is right, not self
                };
            }
        });

        Meteor.methods(namespaced);
    }

    _initTypes() {
        this.addMetaType('node', WtDataTree.Node);
        this.addMetaType('tag', WtDataTree.Tag);
    }

    _initCols() {
        var self = this;

        this._col = {};
        this._cache = {};
        this._initCol('node');
        this._initCol('tag');
        // todo remove from caches
    }

    _initCol(name, create) {
        var cache = this._cache[name] = createCache(this, create);
        var col = this._col[name] = WtDataTree.Collection(this._name + _.capitalize(name) + 's');
        col._dtTransform = tryWrapTransform(function (data) {
            return cache.get(data._id, data);
        });
    }

    constructor (name) {
        this._name = name;

        this._ready = new ReactiveVar(false);

        this._metaTypes = {};

        this._readyCb = [];

        this._initTypes();
        this._initMethods();
        this._initCols();

        this._needInit = true;
        this._initData();

        WtDataTree._dts[name] = this;
    }

    _onReady() {
        var self = this;
        this._col.node.find({}).observe({
            changed(nodeData, old) {
                self._cache.node.get(nodeData._id, nodeData);
            },
            removed(nodeData) {
                self._cache.node.remove(nodeData._id);
            }
        });

        this._ready.set(true);
        _.each(this._readyCb, function (cb) {
            cb();
        });
        delete this._readyCb;

    }

    /**
     * Add some ready callback, will be fired when data tree will be ready to work with
     * @param cb - callback to add
     */
    onReady(cb) {
        if (this._ready.curValue) {
            cb();
        } else {
            this._readyCb.push(cb);
        }
    }

    /**
     * Is datatree ready
     * @returns {boolean}
     */
    isReady() {
        return this._ready.get();
    }

    /**
     * Act as an Collection.find()
     * @param {Object|String} query or id of node
     * @param {boolean} [noTransform=false] don't transform while
     * @returns {Mongo.Cursor} returns cursor of nodes found
     */
    find(query, noTransform) {
        check(query, Match.OneOf(Object, String));

        if (typeof query === 'string') {
            query = { _id: query };
        }

        var options = noTransform ? undefined : { transform: this._col.node._dtTransform };

        return this._col.node.find(query, options);
    }

    /**
     * Find some child by its id
     * @param {String|Object} query - some mongo query or node id to search
     * @param {boolean}  [noTransform=false] don't transform while
     * @returns {WtDataTree.Node} returns node or null if nothing found
     */
    findOne(query, noTransform) {
        check(query, Match.OneOf(Object, String));

        if (typeof query === 'string') {
            query = { _id: query };
        }

        var options = noTransform ? undefined : { transform: this._col.node._dtTransform };

        return this._col.node.findOne(query, options);
    }

    onChange(callback) {
        this._col.node.find().observe({
            added: callback,
            removed: callback
        });
    }

    /**
     * Get root node of the tree
     * @returns {WtDataTree.Node}
     */
    getRoot() {
        return this.findOne(WtDataTree._rootData);
    }

    /**
     * Create new node tag
     * @param {String} name - tag name
     * @param {null|String} id - optional tag id
     * @returns {WtDataTree.Tag} created tag
     */
    //createTag(name, id) {
    //    check(name, String);
    //    check(id, Match.Optional(String));
    //
    //    var tagData = { name: name };
    //    if (id)
    //        tagData._id = id;
    //
    //    var tagId = this._col.tag.insert(tagData); // TODO unificate
    //    var tag = this._col.tag.findOne(tagId);
    //
    //    // update tags collection
    //    this._tags[tag.name()] = tag;
    //
    //    return tag;
    //},

    /**
     * Get tag by its name
     * @param {String} tagName - tag to search
     * @returns {WtDataTree.Tag|null} - return tag
     */
    getTag(tagName) {
        check(tagName, String);

        var tagCol = this._col.tag;
        var tag = tagCol.findOne(tagName, { transform: tagCol._dtTransform });
        if (typeof tag === 'undefined') {
            throw ('tag with id ' + tagName + ' not found');
        }

        return tag;
    }

    addMetaType(typeName, typeClass) {
        check(typeName, String);

        if (!typeClass)
            throw new Meteor.Error(400, 'meta type not specified: ' + typeName);

        check(typeClass.prototype, WtDataTree.Meta); // check typeClass inherits Meta

        if (typeName in this._metaTypes) {
            throw new Meteor.Error(403, 'meta type already defined: ' + typeName);
        }

        this._metaTypes[typeName] = typeClass;
    }

    getMetaType(typeName) {
        check(typeName, String);

        var metaType = this._metaTypes[typeName];
        if (!metaType) {
            throw new Meteor.Error(404, 'meta type not found: ' + typeName);
        }

        return metaType;
    }

    // TODO say 'yes' to clear all
    _clear(yes) {
        if (yes === 'yes') {
            console.log('clearing tree');
            return true;
        }

        return false;
    }

    createTag(name, data, cb) {
        var self = this;
        if (_.isFunction(data)) {
            cb = data;
            delete data;
        }
        self.call('createTag', name, data, _.isFunction(cb) ? function (e, r) {
            var tagsCol = self._col.tag;
            cb(tagsCol.findOne({ _id: name }, { transform: tagsCol._dtTransform }));
        } : undefined);
    }
};
