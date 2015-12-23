Package.describe({
  name: 'finance-model',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  documentation: 'README.md'
});

Npm.depends({
    "sequelize": "3.12.1", // ORM library
    "sequelize-cli": "2.0.0", // command line interface for ORM library
    "sequelize-transforms": "1.0.0", // property modifiers for ORM library
    //"pg": "4.4.2", // postgres library
    //"pg-native": "1.9.0", // native postgres library (faster?)
    //"pg-hstore": "https://github.com/scarney81/pg-hstore/archive/7347c348b2d76f5922369067f320a0e9e9e81743.tar.gz", // postgres library module needed by ORM
    "bignumber.js": "2.0.8", // library for arbitrary-precision decimal and non-decimal arithmetic
    "mysql": "2.9.0" // mysql|mariadb library
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.0.2');
    api.use('ecmascript');
    api.use('check');
    api.use('iron:router');
    api.use('jparker:crypto-md5');
    api.addFiles('sequelize.js', 'server');
    api.addFiles('bignumber.js', 'server');
    api.addFiles('helpers.js', 'server');
    api.addFiles('model/Currency.js', 'server');
    api.addFiles('model/Account.js', 'server');
    api.addFiles('model/Invoice.js', 'server');
    api.addFiles('model/Transaction.js', 'server');
    api.addFiles('model/ExchangeRate.js', 'server');
    api.addFiles('model/ExchangeRateHistory.js', 'server');
    api.addFiles('model/RawRequest.js', 'server');
    api.addFiles('route/route-helpers.js', 'server');
    api.addFiles('route/account-routes.js', 'server');
    api.addFiles('route/currency-routes.js', 'server');
    api.addFiles('route/invoice-routes.js', 'server');
});

Package.onTest(function(api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('check');
    api.use('underscore');
    api.use('jparker:crypto-md5');
    api.addFiles('sequelize.js', 'server');
    api.addFiles('bignumber.js', 'server');
    api.addFiles('Currency.js');
    api.addFiles('Account.js');
    api.addFiles('Invoice.js');
    api.addFiles('Transaction.js');
    api.addFiles('ExchangeRate.js');
    api.addFiles('ExchangeRateHistory.js');
    api.addFiles('RawRequest.js');
    api.addFiles('finance-model-tests.js');
});
