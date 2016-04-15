/**
 * Created by kriz on 08.12.14.
 */

var findInView = function (view, func) {
    while (view) {
        var res = func(view);
        if (res !== undefined)
            return res;

        view = view.originalParentView || view.parentView;
    }

    return undefined;
};

DataTreeInit = class DataTreeInit {
    //_name: string;
    //
    //_treeCol: Mongo.Collection;
    //_treeSub: any;
    //
    //_tagsCol: Mongo.Collection;
    //_tagsSub: any;
    //
    //_tags: Tag[];

    _initData() {
        var self = this;

        // meta only on client
        this._initCol('meta', function (data) {
            var nodesCol = self._col.node;
            var node = nodesCol.findOne({ _id: data._n }, { transform: nodesCol._dtTransform });
            check(node, WtDataTree.Node);
            return _.construct('fromData', self.getMetaType(data._t), node, data);
        });


        this._subs = [];
        var b = new WtUtils.ReadyBarrier(self._onReady.bind(self));

        self._nodeSub = Meteor.subscribe(self._name + 'Init', b.callback());
        Meteor.subscribe(self._name + 'Immediates', b.callback());

        delete self._needInit;
    }

    call(method /*, params */) {
        arguments[0] = this._prefix + method;
        Meteor.call.apply(Meteor, arguments);
        var result = this._methResult;
        this._methResult = undefined;
        return result;
    }

    _subscribe(pubName /*, params */) {
        var self = this;
        var args = _.args(arguments);


        if (Blaze.currentView) {
            console.log('adding ' + args[0] + ' to view');
            var instance = findInView(Blaze.currentView, function (view) {
                return view._templateInstance;
            });
            if (instance) {
                return instance.subscribe.apply(instance, args);
            }
        }

        var sub = Meteor.subscribe.apply(Meteor, args);
//            sub.onStop(function () {
//                self._sub = _.without(self._sub, this);
//            });
        this._subs.push(sub);
        return sub;
    }

    subscribeChildren(parentId, callback) {
        return this._subscribe(this._name + 'C', parentId, callback);
    }

    subscribeNode(nodeId, withChildren, callback) {
        var sub = this._subscribe(this._name + 'Id', nodeId);
        if (withChildren)
            sub = this.subscribeChildren(nodeId, callback);

        return sub;
    }

    findMeta(query, options) {
        var metaCol = this._col.meta;
        var o = { transform: metaCol._dtTransform };

        if (options)
            _.defaults(o, options);

        return metaCol.find(query, o);
    }
}

WtDataTree.Dt = function (name) {
    if (!WtDataTree._dts[name])
        throw new Meteor.Error(404, 'datatree not found ' + name);

    return WtDataTree._dts[name];
};


