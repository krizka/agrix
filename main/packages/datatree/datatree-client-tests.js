// Write your tests here!
// Here is an example.


datatreeTestJ('DataTree - node.metaStream()', function (done) {
    var root = datatree.getRoot();
    var stream = root.metaStream();
    var m1 = root.createMeta('some', { data: 1 });
    var m2 = root.createMeta('some', { data: 2 });
    root.save();

    expect(stream.count()).toBe(2);
    expect(stream.find({ data: 2 }).count()).toBe(1);

    expect(root.meta()[0].id()).toBe(m1.id());
    expect(root.meta()[1].id()).toBe(m2.id());

    stream.insert({ _t: 'some', data: 3 }, function () {
        expect(stream.count()).toBe(3);
        expect(root.meta().length).toBe(3);
        expect(stream.find({ data: 2 }).count()).toBe(1);

        done();
    });

});
