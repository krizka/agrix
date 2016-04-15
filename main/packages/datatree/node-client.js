/**
 * Created by kriz on 10/09/15.
 */

NodeMixin = class NodeMixin {
    meta(type) {
        var q = { _n: this.id() };
        if (type)
            q._t = type;

        var metaCol = this._dt._col.meta;
        return metaCol.find(q, { transform: metaCol._dtTransform }).fetch();
    }

    /**
     * Get meta by meta id
     * @param id - meta id
     * @returns {WtDataTree.Meta}
     */
    metaById(id) {
        var metas = this.findMeta({_id: id}, {limit: 1}).fetch();
        if (metas.length > 0)
            return metas[0];

        throw new Meteor.Error(400, 'meta not found with id', id);
    }


    findMeta(query, options) {
        return this._findMeta({ _n: this.id() }, query, options);
    }

    findChildMeta(query, options) {
        return this._findMeta({ _p: this.id() }, query, options);
    }

    _findMeta(forceQuery, query, options) {
        check(query, Match.OneOf(Object, undefined));
        check(options, Match.OneOf(Object, undefined));

        var metaCol = this._dt._col.meta;

        var q = forceQuery;
        if (query)
            q = _.defaults(q, query);

        var o = { transform: metaCol._dtTransform };
        if (options)
            o = _.defaults(o, options);

        return metaCol.find(q, o);
    }

    saveMeta(meta, cb) {
        this._dt.call('saveMeta', this.id(), meta.data(), meta._isNew, cb);
    }

    createMeta(type, metaData) {
        metaData = _.extend(metaData || {}, { _t: type, _id: undefined });
        return _.construct('fromData', this._dt.getMetaType(type), this, metaData);
    }
}
