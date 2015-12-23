'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.createTable(
            "rawRequest",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                userId: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                hash: {
                    type: Sequelize.STRING(32),
                    allowNull: false
                },
                method: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                rawData: {
                    type: Sequelize.TEXT,
                    allowNull: false
                },
                response: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                deletedAt: {
                    type: Sequelize.DATE,
                    allowNull: true
                }
            }
        );
        queryInterface.createTable(
            "exchangeRateHistory",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                fromCurrency: {
                    type: Sequelize.STRING(3),
                    allowNull: false
                },
                toCurrency: {
                    type: Sequelize.STRING(3),
                    allowNull: false
                },
                rate: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                userData: {
                    type: Sequelize.BLOB
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                deletedAt: {
                    type: Sequelize.DATE,
                    allowNull: true
                }
            }
        );
        queryInterface.createTable(
            "currency",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                code: {
                    type: Sequelize.STRING(3),
                    allowNull: false,
                    unique: true
                },
                userData: {
                    type: Sequelize.BLOB,
                    allowNull: true
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.dropTable("rawRequest");
        queryInterface.dropTable("exchangeRateHistory");
        queryInterface.dropTable("currency");
    }
};