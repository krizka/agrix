Package.describe({
    name: 'wtw:telegram-bot',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.1');

    Npm.depends({
        "telegram.link": "0.6.3",
        "get-log": "1.1.5",
        "avconv" : "3.0.1"
    });

    api.use('http');
    api.use('check');
    api.use('ecmascript');
    api.use('underscore');
    api.use('templating');

    api.addFiles(['_.js', 'settings.js']);

    api.addFiles([
        'emoji.js',
        'methods.js',
        'telegram-bot.js',
        'client/telegram-client.js'
    ], 'server');


    api.addFiles([
        'interface.html',
        'interface.js'
    ], 'client');

    api.export('WtTelegram');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('wt:telegram-bot');
    api.addFiles('telegram-bot-tests.js');
});
