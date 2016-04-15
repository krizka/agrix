/**
 * Created by kriz on 08.12.14.
 */

WtDataTree.IntMeta = class IntMeta {
    //_node: Node;
    //_data: MetaJson;

    create() {
        this._data = {};
    }

    fromData(data) {
        check(data, Match.ObjectIncluding({
            _t: String
        }));

        if (!data._id) {
            data._id = Random.id();
            this._isNew = true;
        }

        this._meta = null;
        this._data = data;
    }

    _updateData(threadData) {
        this._data = threadData;
        this._updateMeta();
    }

    _updateMeta() {
        if (!this._meta || !this._data.m)
            return;

        var self = this;
        this._meta = _.map(this._data.m, function (metaData) {
            var meta = _.find(self._meta, function (meta) {
                return meta && meta._data._id === metaData._id;
            });

            if (meta) {
                meta._updateData(metaData);
            }

            return meta;
        });

        // update meta depends
        if (this._depMeta)
            this._depMeta.changed();
    }


    /**
     * Meta ID
     * @returns {String} meta id
     */
    id(value) {
        return this.data('_id', value);
    }

    /**
     * Get meta type
     * @returns {String} meta type
     */
    type(value) {
        return this.data('_t', value);
    }

    /**
     * Get internal meta data
     * @param {String} [keypath]
     * @param {*} [value]
     * @returns {*} meta data
     */
    data(keypath, value) {
        if (!_.isString(keypath))
            return this._data;
        if (_.isUndefined(value))
            return _.getValue(this._data, keypath);
        _.setValue(this._data, keypath, value);
    }

    /**
     * Copy some object over meta data
     * @param {Object} obj - object to extend meta data with
     */
    copy(obj) {
        if ('_t' in obj)
            throw new Meteor.Error(403, 'Cant change meta type');

        _.extend(this._data, obj);
    }

    defaults(obj) {
        if ('_t' in obj)
            throw new Meteor.Error(403, 'Cant change meta type');

        _.defaults(this._data, obj);
    }

    equals(other) {
        return other instanceof WtDataTree.Meta && this._data === other._data;
    }

    _ensureMeta(index) {
        this._meta = this._meta || [];

        var meta = this._meta[index];
        if (!meta) {
            var data = this._data.m[index];
            meta = this._meta[index] = _.construct('fromData', this._dt.getMetaType(data._t), this, data);
        }

        return meta;
    }

    depMeta() {
        if (Tracker.active) {
            this._depMeta = this._depMeta || new Tracker.Dependency();
            this._depMeta.depend();
        }
    }

    /** is node have any child
     * @returns {boolean}
     */
    hasMeta(type) {
        this.depMeta();

        return this._data.m &&
            (
                type
                    ? _.any(this._data.m,
                    function (m) {
                        return m._t == type
                    })
                    : this._data.m.length > 0
            );
    }

    firstMeta() {
        if (!this.hasMeta())
            throw new Meteor.Error(404, 'first meta not found in ' + this.id());

        return this._ensureMeta(0);
    }

    /**
     * Get all node  meta objects
     * @returns {WtDataTree.Meta[]}
     */
    meta(typeName) {
        var self = this;

        if (!this.hasMeta()) {
            return [];
        }

        var result = [];
        _.each(this._data.m, function (data, index) {
            if (!typeName || data._t === typeName) {
                result.push(self._ensureMeta(index));
            }
        });

        return result;
    }

    /**
     * Get metastream of metas from this node
     * @returns {ArrayCursor<Meta>}
     */
    metaStream() {
        var self = this;
        if (!self._metaStream) {
            this._data.m = this._data.m || [];
            var rawMetas = this._data.m;

            self._metaStream = new WtStreams.ArrayStream(rawMetas, {
                    transform(doc) {
                        var meta = self.metaById(doc._id);
                        return meta;
                    },
                    observer: {
                        added(id, fields) {
                            var doc = _.extend({ _id: id }, fields);
                            self.createMeta(fields._t, doc, true);
                            self.save();
                        },
                        changed(id, fields) {
                            var index = _.findIndex(self._data.m, _.comparator('_id', id));

                            var meta = this._meta ? this._meta[index] : null;
                            if (meta) {
                                meta.copy(fields);
                            } else {
                                _.extend((self._data.m[index]), fields);
                            }

                            self.save();
                        },

                        removed(id) {
                            self.removeMeta(id, true);
                            self.save();
                        }
                    }
                }
            );

        }

        return self._metaStream;
    }

    /**
     * Get meta by meta id
     * @param id - meta id
     * @returns {WtDataTree.Meta}
     */
    metaById(id) {
        if (!this.hasMeta()) {
            return null;
        }

        // TODO optimize by searching with ID in stream
        for (var index = 0; index < this._data.m.length; index++) {
            if (this._data.m[index]._id == id) {
                return this._ensureMeta(index);
            }
        }

        throw new Meteor.Error(400, 'meta not found with id', id);
    }

    /**
     * Add new meta to object
     * @param {String} type type of created meta
     * @returns {Meta} created meta
     */
    createMeta(type, data, fromStream) {
        check(type, String);

        var metaData = _.extend({}, data, { _t: type });

        if (this._metaStream && !fromStream) {
            var id = this._metaStream.insert(metaData);
            return this._metaStream.findOne(id);
        } else {
            var meta = _.construct('fromData', this._dt.getMetaType(type), this, metaData);

            this._data.m = this._data.m || [];
            this._data.m.push(meta.data());

            this._meta = this._meta || [];
            this._meta.push(meta);

            return meta;
        }
    }

    /**
     * Remove meta from type
     * @param meta - meta to remove
     */
    removeMeta(meta, fromStream) {
        check(meta, Match.OneOf(WtDataTree.Meta, String));

        var id = typeof meta === 'string' ? meta : meta.id();

        if (this._metaStream && !fromStream) {
            this._metaStream.remove({ _id: id });
        } else {
            var metaIndex = _.findIndex(this._data.m, _.comparator('_id', id));
            if (~metaIndex) {
                this._data.m.splice(metaIndex, 1);
                this._meta.splice(metaIndex, 1);
            } else {
                throw new Meteor.Error(404, 'meta ' + id + ' not found in node ' + this.id());
            }
        }
    }
}

WtDataTree.Meta = class Meta extends IntMeta {
    fromData(node, data) {
        WtDataTree.IntMeta.super('fromData', this, data);
        this._node = node;
        if (!data.r)
            data.r = 0;
    }

    /**
     * Get node meta belongs to
     * @returns {WtDataTree.Node} node which meta belongs to
     */
    node() {
        return this._node;
    }

    save(cb) {
        if (!cb)
            cb = function (error, res) {
                //console.log('meta saved', error, res);
            };

        this._node.saveMeta(this, cb);
    }
};

WtDataTree.metaAccessor = function (name, set) {
    if (arguments.length < 2)
        set = true;

    if (set) {
        return function (newValue) {
            var val = this._data[name];
            if (typeof newValue !== 'undefined') {
                this._data[name] = newValue;
            }
            return val;
        }
    } else {
        return function () {
            return this._data[name];
        }
    }
};
