Package.describe({
    name: 'wtw:datatree',
    summary: 'DataTree package',
    version: '0.5.0',
    git: ' /* Fill me in! */ '
});

Package.onUse(function (api) {
    api.versionsFrom('1.0');
//    api.use('meteortypescript:compiler');
    api.use(['deps',
        'underscore',
        'mongo',
        'random',
        'reactive-var',
        'check',
        'templating',
//        'wtw:jscache',
//        'wtw:streams',
//        'wtw:utils'
    ]);

    api.addFiles('_.js');

    api.addFiles('meta.js');
    api.addFiles('tags.js');
    api.addFiles('node-client.js', 'client');
    api.addFiles('node.js');

    api.addFiles('methods-client.js', 'client');
    api.addFiles('methods.js');

    api.addFiles('subscribe.js', 'client');
    api.addFiles('publish.js', 'server');

    api.addFiles('datatree.js');

    api.export('WtDataTree');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('sanjo:jasmine@0.17.0');
    api.use('frozeman:q');
    api.use('wtw:jsclass');
    api.use('wtw:datatree');
    api.addFiles('datatree-prepare-tests.js');
    api.addFiles('datatree-tests.js');
    api.addFiles('datatree-client-tests.js', 'client');
});
