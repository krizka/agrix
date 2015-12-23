// initialize sequelize library with plugins and database connection settings
SLib = Npm.require("sequelize");

var environment = process.env.NODE_ENV || "development";

Sequelize = new SLib(
    Meteor.settings[environment].database,
    Meteor.settings[environment].username,
    Meteor.settings[environment].password,
    {
        host: Meteor.settings[environment].host,
        dialect: Meteor.settings[environment].dialect,

        pool: {
            max: 5,
            min: 0,
            idle: 1000000
        }
    }
);

var sequelizeTransforms = Npm.require('sequelize-transforms');
sequelizeTransforms(Sequelize);
