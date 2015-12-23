'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.createTable(
            "exchangeRate",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                fromCurrencyId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "currency",
                        key: "id"
                    }
                },
                toCurrencyId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "currency",
                        key: "id"
                    }
                },
                rate: {
                    type: Sequelize.INTEGER,
                    allowNull: false
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
                },
                deletedAt: {
                    type: Sequelize.DATE,
                    allowNull: true
                }
            }
        );
        queryInterface.createTable(
            "account",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                ownerId: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                currencyId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "currency",
                        key: "id"
                    }
                },
                amount: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: "0"
                },
                amountInt: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                    defaultValue: 0
                },
                userData: {
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
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.dropTable("exchangeRate");
        queryInterface.dropTable("account");
    }
};