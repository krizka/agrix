/** server-side datatree methods */
var fieldsId = { fields: { _id: 1 } };

MethodsMixin = MethodsMixin || {};

DataTreeMethods = {

    createChild(dt, parentId, name, tags) {
        check(name, Match.OneOf(String, undefined, null));
        check(tags, Match.OneOf([String], undefined, null));
        var childData = _.clone(WtDataTree._initData);
        childData.p = [parentId];
        // add name if any
        if (name) {
            childData.n = name;
        }

        // add tags
        if (Meteor.isServer && tags) {
            tags = dt._col.tag.find({ _id: { $in: tags } }, fieldsId)
                .map(function (tag) {
                    return tag._id
                });
        }
        childData._ta = tags;

        var nodesCol = dt._col.node;
        var childId = nodesCol.insert(childData);

        // update only if no children
        nodesCol.update(
            { _id: parentId, c: false },
            { $set: { c: true }, $inc: { r: 1 } }
        );

        return childId;
    },

    addChild(dt, parentId, childId) {
        //update parents, if this parent not exists
        var updDocCount = dt._col.node.update(
            { _id: childId, p: { $ne: parentId } },
            { $push: { p: parentId }, $inc: { r: 1 } }
        );

        if (updDocCount == 1) { //if child added
            // update only if no children
            dt._col.node.update(
                { _id: parentId, c: false },
                { $set: { c: true }, $inc: { r: 1 } }
            );
        }
    },

    removeChild(dt, parentId, childId) {
        var col = dt._col.node;

//        function deleteNode (id) {
//            var result = [id];             // closure array, accumulate all nodes for deleting
//            var forSearch = result;        // closure array, accumulate all nodes for recursive search
//            function removeRecursive () {
//                var children = col.find({ p: { $in: forSearch } }).fetch(); //founding new nodes for analyses
//                forSearch = []; //reset node list for search
//                for (var i = 0; i < children.length; i++) { //iterate founding list
//                    var child = children[i];
//                    if (_.difference(child.p, result).length == 0) { //checking for "to be removed"
//                        result = _.union(result, child._id); //add new "to be removed" to result
//                        forSearch = _.union(forSearch, child._id); //add new "to be removed" to node list for search
//                    }
//                }
//
//                if (forSearch.length > 0) { //if result is changed - adding process
//                    removeRecursive();
//                }
//            }
//
//            removeRecursive();
//
//            col.remove({ _id: { $in: result } }); //deleting nodes from db
//            col.update(  //deleting links
//                { p: { $in: result } },
//                { $pullAll: { p: result }, $inc: { r: 1 } },
//                { multi: true }
//            );
//        }

        var updateCount = col.update({ _id: childId, p: parentId }, {
            $pull: { p: parentId },
            $inc: { r: 1 }
        });

        if (updateCount > 0) {
            if (col.find({ p: parentId }, { limit: 1, fields: { _id: 1 } }).count() === 0) {
                col.update(
                    { _id: parentId },
                    { $set: { c: false }, $inc: { r: 1 } }
                );
            }
        }

//        if (updateCount == 1) {
//            var child = col.findOne(childId);
//            if (child.p.length == 0) {
//                deleteNode(childId);
//            }
//            var parent = col.findOne(parentId, { transform: col._dtTransform });
//            //console.log(parent);
//            parent.children(function (children) {
//                if (children.length == 0) {
//                    col.update(
//                        { _id: parentId },
//                        { $set: { c: false }, $inc: { r: 1 } }
//                    );
//                }
//            });
//        }

    },

    save(dt, nodeData) {
        var nodeCol = dt._col.node;
//        var metaCol = dt._col.meta;

        ++nodeData.r;

        var nodeId = nodeData._id;
        delete nodeData._id;
        //delete nodeData.m;

//        if (this.isSimulation) {
//            // find diff and update collections
//            var newMetas = nodeData.m;
//            //delete nodeData.m; TODO remove
//            // TODO update r on meta save
//            // collect all current metas
//            var oldMetas = metaCol.find({ _n: nodeId }).fetch();
//            for (var i = 0; i < newMetas.length; i++) {
//                var newMeta = newMetas[i];
//
//                newMeta._p = nodeData.p;
//                newMeta._n = nodeId;
//
//                var oldMeta = _.findWhere(oldMetas, { _id: newMeta._id });
//                // if we have previous meta and have current - then maybe update new meta
//                if (oldMeta) {
//                    // remove old meta from oldMetas to find which metas is not present in new one
//                    oldMetas = _.without(oldMetas, oldMeta);
//
//                    // but first compare its revisions
//                    if (newMeta.r > oldMeta.r) {
//                        metaCol.update({ _id: newMeta._id }, { $set: newMeta });
//                    }
//                } else {
//                    // no previous meta - just insert
//                    metaCol.insert(newMeta);
//                }
//            }
//            // now remove collected abandoned metas
//            _.each(oldMetas, function (oldMeta) {
//                dt._col.meta.remove({ _id: oldMeta._id });
//            });
//        }

        nodeCol.update(
            { _id: nodeId },
            { $set: nodeData }
        );
    },

    saveMeta(dt, nodeId, metaData, isNew) {
        check(nodeId, String);
        check(metaData, Object);
        // todo check id uniq
        check(metaData._id, String);

        // TODO make it not so ugly
        if (!metaData.r)
            metaData.r = 0;

        metaData.r++;


        if (this.isSimulation) {
            metaData._n = nodeId;
            metaData._p = dt._col.node.findOne({ _id: nodeId }).p;

            if (isNew) {
                dt._col.meta.insert(metaData)
            } else {
                var metaId = metaData._id;
                delete metaData._id;

                dt._col.meta.update({ _n: nodeId, _id: metaId }, { $set: metaData });
            }

        } else {
            delete metaData._n;
            delete metaData._p;

            if (isNew) {
                dt._col.node.update(
                    { _id: nodeId },
                    { $push: { m: metaData } }
                );
            } else {
                dt._col.node.update(
                    { _id: nodeId, 'm._id': metaData._id },
                    { $set: { 'm.$': metaData } }
                );
            }
        }

    },

    createTag(dt, name, data) {
        var col = dt._col.tag;

        var found = col.findOne({ _id: name }, fieldsId);
        if (found !== undefined) {
            return found._id;
        }

        // todo check data have no
        var _data = { _id: name, _t: 'tag' };
        _.defaults(_data, data);

        return col.insert(_data);
    },

    addTags(dt, nodeId, tags) {
        var tagCol = dt._col.tag;
        var nodeCol = dt._col.node;

        var existingTagNames = tagCol.find({ _id: { $in: tags } }, fieldsId).map(function (tag) {
            return tag._id;
        });

        if (existingTagNames.length > 0) { // tags exists in tags collection
            nodeCol.update(
                { _id: nodeId, _ta: { $nin: existingTagNames } },
                { $addToSet: { _ta: { $each: existingTagNames } }, $inc: { r: 1 } });

//            var node = nodeCol.findOne(nodeId);
//            var nodeTags = node._ta || [];
//
//            var newTags = _.union(nodeTags, existingTagNames);
//            if (nodeTags.length < newTags.length) {
//                nodeCol.update({ _id: nodeId }, { $set: { _ta: newTags }, $inc: { r: 1 } });
//            }
        }
        return existingTagNames;
    },

    removeTag(dt, nodeId, name) {
        var nodeCol = dt._col.node;
        nodeCol.update({ _id: nodeId, _ta: name }, { $pull: { _ta: name }, $inc: { r: 1 } });
    },

    name(dt, nodeId, name) {
        var nodeCol = dt._col.node;
        nodeCol.update({ _id: nodeId, name: { $ne: name } }, { $set: { n: name }, $inc: { r: 1 } });
    },

    changeParent(dt, nodeId, srcParentId, dstParentId) {
        var nodeCol = dt._col.node;

        var x = nodeCol.update({ _id: nodeId, p: srcParentId }, { $pull: { p: srcParentId } });
        if (x > 0) {
            nodeCol.update({ _id: nodeId }, { $push: { p: dstParentId }, $inc: { r: 1 } });
            nodeCol.update({ _id: dstParentId, c: false }, { $set: { c: true }, $inc: { r: 1 } });
        }
    }
};

_.extend(DataTreeMethods, MethodsMixin);
