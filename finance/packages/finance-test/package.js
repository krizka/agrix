Package.describe({
  name: 'finance-test',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.0.2');
    api.use('ecmascript');
    api.use('http');
    api.use('session');
    api.use('templating');
    api.use('iron:router');
    api.use('ddp');
    api.use('jparker:crypto-md5');
    api.use('finance-model');
    api.addFiles([
        'client.js',
        'template.html',
        'account.html',
        'currency.html',
        'invoice.html',
        'template.js',
        'template.css'
    ], 'client');
    api.addFiles('server.js', 'server');
});
