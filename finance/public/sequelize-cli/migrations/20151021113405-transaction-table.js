'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.createTable(
            "transaction",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                accountId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "account",
                        key: "id"
                    }
                },
                amount: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                amountInt: {
                    type: Sequelize.BIGINT,
                    allowNull: false
                },
                invoiceId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "invoice",
                        key: "id"
                    }
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
        queryInterface.dropTable("transaction")
    }
};