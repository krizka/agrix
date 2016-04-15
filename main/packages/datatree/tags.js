// Tag klass
WtDataTree.Tag = class Tag extends Meta {
    //_dt: DataTree;
    //_data: TagJson;

    create(name) {
        WtDataTree.Meta.super(this, { _t: 'tag' });
        this._data._id = name;
    }

    fromData(datatree, data) {
        WtDataTree.Meta.super('fromData', this, this, data);
        this._dt = datatree;
    }

    id() {
        return this._data._id;
    }

    name() {
        return this._data._id;
    }

    description() {
        return this._data.d;
    }
    //meta() {
    //},

    save() {
        this._dt._col.tag.update(
            { _id: this._data._id },
            { $set: this._data }
        );
    }
}


// tags protocol for Node and Meta extending
WtDataTree.TagsProto = class TagsProto  {
    //_data: NodeJson;

    tags() {
        if (this.haveTags()){
            return this._data._ta;
        } return [];

    }

    tagsCount() {
        return this.tags().length;
    }

    haveTags() {
        return this._data._ta !== undefined && this._data._ta.length > 0;
    }

    addTags(tags, cb) {
        this._dt.call('addTags', this.id(), tags, cb);
    }

    tagExists(name) {
        return this.haveTags() && _.indexOf(this._data._ta, name) > -1;
    }

    removeTag(name, cb) {
        var self = this;
        this._dt.call('removeTag', this.id(), name, function (e, res) {
            if (!e)
                self._data._ta = _.without(self._data._ta, name);
            if (cb)
                cb(e, res)
        });
    }

}
