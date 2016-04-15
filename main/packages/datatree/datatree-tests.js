// Write your tests here!
// Here is an example.

var dt = WtDataTree;
datatree;


var index = 0;

var setup = function (onReady) {
    index = Meteor.uuid();
    var prefix = 'test' + index;

    var create = function () {
        datatree = new dt.DataTree(prefix);
        datatree.addMetaType('some', SomeMeta);
        datatree.onReady(onReady);
    };

    if (Meteor.isClient) {
        Meteor.call('DT_create', prefix, create);
    } else {
        create();
    }
};

var teardown = function () {
    if (Meteor.isServer) {
        datatree._col.node.remove({});
        datatree._col.tag.remove({});
    }
    datatree = null;
};

SomeMeta = dt.Meta.extend({});

//datatreeTest = function (name, cb) {
//    Tinytest.addAsync(name, function (next) {
//        var newNext = function () {
//            teardown();
//            next();
//        };
//
//        setup(function () {
//            cb(test, newNext);
//        });
//    });
//
//};

datatreeTest = datatreeTestJ = function (name, cb) {
    var names = name.split(' - ');
    describe(names[0], function () {
        it(names[1], function (next) {
            var newNext = function () {
                teardown();
                next();
            };

            setup(function () {
                cb(newNext);
            });
        });
    });

};

datatreeTest('DataTree - addChild', function (next) {
    var root = datatree.getRoot();
    expect(root.hasChildren()).toBeFalsy();
    var child1 = root.createChild('child1', undefined);
    expect(child1).toBeDefined();
    expect(child1.name()).toBe('child1');

    root = datatree.getRoot();
    expect(root.hasChildren()).toBeTruthy();
    var child2 = root.createChild('child2', undefined);
    expect(child2).toBeDefined();
    expect(child2.name()).toBe('child2');

    root = datatree.getRoot();
    expect(root.hasChildren()).toBeTruthy();

    expect(child1.hasChildren()).toBeFalsy();

    child1.addChild(child2.id());

    root = datatree.getRoot();
    root.findChildren(function (rootChildren) {
        rootChildren = rootChildren.fetch();
        child1 = rootChildren[0];

        expect(child1.hasChildren(), 'has children after addChild').toBeTruthy();
        child1.findChildren(function (child1Children) {
            child1Children = child1Children.fetch();
            expect(child1Children.length).toBe(1);

            //trying to add existing child
            child1.addChild(child2.id());

            child1.findChildren(function (children) {
                children = children.fetch();
                expect(children.length).toBe(1); //children count shouldn't be changed
                //trying to add oneself
                child1.addChild(child1.id());

                root = datatree.getRoot();
                root.findChildren({ n: 'child1' }, function (rootChildren) {
                    var child1 = rootChildren.fetch()[0];

                    child1.findChildren(function (children) {
                        expect(children.count()).toBe(2); //children count should be increased

                        next();
                    });
                });
            });
        });
    });
});

datatreeTest('DataTree - removeChild 1', function (next) {
    var root = datatree.getRoot();
    expect(root.hasChildren()).toBeFalsy(); // root mast have 0 children
    var child1 = root.createChild('child1', undefined);

    root = datatree.getRoot();
    expect(root.hasChildren()).toBeTruthy(); // root mast have children
    root.findChildren(function (children) {
        children = children.fetch();
        expect(children.length).toBe(1);
        root.removeChild(child1.id());

        root = datatree.getRoot();
        expect(root.hasChildren()).toBeFalsy(); // root mast have 0 children
        next();
    })


});

datatreeTest('DataTree - removeChild 2', function (next) {
    datatree.onReady(function () {
        var root = datatree.getRoot();
        expect(root.hasChildren()).toBeFalsy(); // root mast have 0 children

        var child1 = root.createChild('child1');

        root = datatree.getRoot();
        root.findChildren(function (rootChildren) {
            rootChildren = rootChildren.fetch();
            expect(rootChildren.length).toBe(1); // root mast have 1 child

            var child2 = root.createChild('child2');
            root = datatree.getRoot();
            root.findChildren(function (rootChildren) {
                rootChildren = rootChildren.fetch();
                expect(rootChildren.length).toBe(2); // root mast have 2 children

                for (var i = 0; i < rootChildren.length; i++) {
                    if (rootChildren[i].name() == 'child1') {
                        child1 = rootChildren[i];
                    }
                }

                root.removeChild(child1.id());
                root = datatree.getRoot();

                root.findChildren(function (rootChildren) {
                    rootChildren = rootChildren.fetch();
                    expect(rootChildren.length).toBe(1); // root mast have 1 child
                    next();
                });
            });
        });
    });
});

datatreeTest('DataTree - removeChild 3', function (next) {
    //create graph with 5 nodes
    //root < node1 < node3 < node4
    //root < node2 < node4
    //node1 < node2

    // c\p     node0 node1 node2 node3 node4
    // node1     *
    // node2     *     *
    // node3           *
    // node4                 *     *
    // 6 edges

    // I want to remove child relation (node1 < node3)
    // expected graph mast be stay

    //root < node1 < node2 < node4
    //root < node2

    // c\p     node0 node1 node2 node3 node4
    // node1     *
    // node2     *     *
    // node3
    // node4                 *
    // 6 edges


    // 4 edges


    var root = datatree.getRoot();
    var node1 = root.createChild('node1');
    var node3 = node1.createChild('node3', undefined);
    var node4 = node3.createChild('node4', undefined);

    root = datatree.getRoot();

    var node2 = root.createChild('node2', undefined);

    node1.addChild(node2.id());


    root = datatree.getRoot();
    root.findChildren(function (rootChildren) {
        rootChildren = rootChildren.fetch();
        for (var i = 0; i < rootChildren.length; i++) {
            if (rootChildren[i].name() == 'node1') {
                node1 = rootChildren[i];
            } else {
                node2 = rootChildren[i];
            }
        }

        node2.addChild(node4.id());


        console.log('tree created');
        //test all edges
        root.findChildren(function (children) {
            children = children.fetch();
            expect(children.length).toBe(2);

            node1.findChildren(function (children) {
                children = children.fetch();
                expect(children.length).toBe(2);

                node2.findChildren(function (children) {
                    children = children.fetch();
                    expect(children.length).toBe(1);


                    node3.findChildren(function (children) {
                        children = children.fetch();
                        expect(children.length).toBe(1);

                        node4.findChildren(function (children) {
                            children = children.fetch();
                            expect(children.length).toBe(0);

                            //modify graph
                            node1.removeChild(node3.id());


                            //test all edges
                            root = datatree.getRoot();
                            root.findChildren(function (rootChildren) {
                                rootChildren = rootChildren.fetch();
                                expect(rootChildren.length).toBe(2);

                                for (var i = 0; i < rootChildren.length; i++) {
                                    if (rootChildren[i].name() == 'node1') {
                                        node1 = rootChildren[i];
                                    } else {
                                        node2 = rootChildren[i];
                                    }
                                }

                                node1.findChildren(function (node1Children) {
                                    node1Children = node1Children.fetch();
                                    expect(node1.name()).toBe('node1');
                                    expect(node1.hasChildren()).toBeTruthy();
                                    expect(node1Children.length).toBe(1);
                                    expect(node1Children[0].name()).toBe('node2');

                                    node2.findChildren(function (node2Children) {
                                        node2Children = node2Children.fetch();
                                        expect(node2.name()).toBe('node2');
                                        expect(node2.hasChildren()).toBeTruthy();
                                        expect(node2Children.length).toBe(1);
                                        expect(node2Children[0].name()).toBe('node4');

                                        node4 = node2Children[0];
                                        expect(node4.name()).toBe('node4');
                                        expect(node4.hasChildren()).toBeFalsy();

                                        next();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

});

datatreeTest('DataTree - root node', function (next) {
    var rootNode = datatree.getRoot();

    expect(rootNode).toEqual(jasmine.any(dt.Node));


    var rootChild = rootNode.createChild('rootChild', undefined);
    expect(rootChild).toEqual(jasmine.any(dt.Node));

    var meta = rootChild.createMeta('some');
    meta.copy({
        name: 'some-data',
        value: 'some-value',
        and: 42,
        and1: 'so on'
    });

    expect(meta.type()).toBe('some');
    expect(meta.data().name).toBe('some-data');
    expect(meta.data().and).toBe(42);

    rootChild.save(function () {
        datatree.getRoot().findChildren(function (children) {
            children = children.fetch();
            expect(children.length).toBe(1);

            var testChild = children[0];
            expect(testChild).not.toBeNull();

            var meta2 = testChild.meta();
            expect(meta2.length).toBe(1);

            var testMeta = meta2[0];


            expect(testMeta.type()).toBe('some');
            var data = testMeta.data();
            expect(data.and1).toBe('so on');

            next();
        });
    });


});


datatreeTest('DataTree - createTag', function (next) {
    datatree.createTag('tag0', { d: 'descr0' }, function (tag0) {
        check(tag0, WtDataTree.Tag);
        expect(tag0.name()).toBe('tag0');
        expect(tag0.description()).toBe('descr0');
        datatree.createTag('tag1', function (tag1) {
            check(tag1, WtDataTree.Tag);
            expect(tag1.name()).toBe('tag1');

            expect(tag1.description()).toBeUndefined();
            next();
        });

    });
});


datatreeTest('DataTree - addTags', function (next) {
    datatree.createTag('tag1', {}, function (tag1) {
        datatree.createTag('tag2', {}, function (tag2) {

            var root = datatree.getRoot();

            var child1 = root.createChild('child1', ['tag100']);
            expect(child1.haveTags()).toBeFalsy();
            expect(child1.tags()).toEqual([]);
            expect(child1.tagsCount()).toBe(0);

            child1.addTags(['123', 'tag2', 'tag1', 'aaa']);
            var root = datatree.getRoot();
            root.findChildren(function (children) {
                children = children.fetch();
                child1 = children[0];
                expect(child1.haveTags()).toBeTruthy();
                expect(child1.tagsCount()).toBe(2);
                expect(child1.tagExists('tag1')).toBeTruthy();
                expect(child1.tagExists('tag2')).toBeTruthy();
                expect(child1.tagExists('aaa')).toBeFalsy();
                expect(child1.tagExists('123')).toBeFalsy();
                expect(child1.tagExists('qqq')).toBeFalsy();
                expect(child1.tagExists('tag100')).toBeFalsy();

                datatree.createTag('tag100', { d: '123456' });
                var root = datatree.getRoot();
                root.findChildren(function (rootChildren) {
                    rootChildren = rootChildren.fetch();
                    child1 = rootChildren[0];
                    child1.addTags(['tag100'], function () {
                        var root = datatree.getRoot();
                        child1 = rootChildren[0];

                        expect(child1.haveTags()).toBeTruthy();
                        expect(child1.tagsCount()).toBe(3);
                        expect(child1.tagExists('tag1')).toBeTruthy();
                        expect(child1.tagExists('tag2')).toBeTruthy();
                        expect(child1.tagExists('aaa')).toBeFalsy();
                        expect(child1.tagExists('123')).toBeFalsy();
                        expect(child1.tagExists('qqq')).toBeFalsy();
                        expect(child1.tagExists('tag100')).toBeTruthy();
                        child1.removeTag('tag100');
                        var root = datatree.getRoot();
                        child1 = rootChildren[0];

//                                        while(child1.tagExists('tag100'))
//                                            Tracker.flush();

                        expect(child1.tagExists('tag100')).toBeFalsy();
                        next();
                    });
                })
            });
        });
    });
});


datatreeTest('DataTree - meta', function (next) {
    var m2;

    var rootNode = datatree.getRoot();

    rootNode.createMeta('some');
    m2 = rootNode.createMeta('some');
    rootNode.createMeta('some');

    expect(m2).toEqual(jasmine.any(SomeMeta));
    m2.data().removed = true;

    rootNode.save();

    rootNode = datatree.getRoot();
    expect(rootNode.meta('some').length).toBe(3);
    expect(rootNode.meta().length).toBe(3);

    rootNode.removeMeta(m2);
    rootNode.save();

    expect(rootNode.meta().length).toBe(2);
    rootNode.meta().forEach(function (m) {
        expect(m).toEqual(jasmine.any(SomeMeta));
        expect(m.data().removed).toBeUndefined();
    });


    rootNode = datatree.getRoot();

    expect(rootNode.meta().length).toBe(2);
    rootNode.meta().forEach(function (m) {
        expect(m.data().removed).toBeUndefined();
    });


    next();
});


datatreeTest('DataTree - Node.name()', function (next) {
    var root = datatree.getRoot();
    var child1 = root.createChild('asd', undefined);
    child1.name('asd1', function () {
        expect(datatree.getRoot().findChildren(function (rootChildren) {
            rootChildren = rootChildren.fetch();
            expect(rootChildren[0].name()).toBe('asd1');
            next();
        }));
    });
});


datatreeTest('DataTree - changeParent() 1', function (next) {
    var root = datatree.getRoot();
    var child1 = root.createChild('child1');
    var child2 = root.createChild('child2');
    root.findChildren(function (rootChildren) {
        rootChildren = rootChildren.fetch();
        for (var i = 0; i < rootChildren.length; i++) {
            var root = datatree.getRoot();
            if (rootChildren[i].name() == 'child1') {
                child1 = rootChildren[i];
            }
        }

        child2.move(root.id(), child1.id());
        root.findChildren(function (rootChildren) {
            rootChildren = rootChildren.fetch();
            expect(rootChildren.length).toBe(1);
            child1 = rootChildren[0];
            expect(child1.name()).toBe('child1');
            child1.findChildren(function (child1Children) {
                child1Children = child1Children.fetch();
                expect(child1Children.length).toBe(1);
                child2 = child1Children[0];
                expect(child2.name()).toBe('child2');
                expect(child2.hasChildren()).toBeFalsy();

                next();
            });
        });
    });
});


datatreeTest('DataTree - changeParent() 2', function (next) {
    var root = datatree.getRoot();
    root.move(root.id(), root.id(), function () { //nothing would be changes
        root = datatree.getRoot();
        expect(root.hasChildren()).toBeFalsy();
        expect(root._data.p).toBeNull();
        expect(root._data.r).toBe(0);

        var child1 = root.createChild('child1');
        root = datatree.getRoot();
        child1.move(root.id(), child1.id());
        root = datatree.getRoot();
        expect(root.hasChildren()).toBeTruthy();

        next();
    });
});
