Transaction = Sequelize.define("transaction",
    {
        id: {
            type: SLib.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        accountId: {
            type: SLib.INTEGER,
            allowNull: false,
            references: {
                model: Account
            }
        },
        amount: {
            type: SLib.STRING,
            allowNull: false

        },
        amountInt: {
            type: SLib.BIGINT,
            allowNull: false
        },
        invoiceId: {
            type: SLib.INTEGER,
            allowNull: true,
            references: {
                model: Invoice
            }
        },
        userData: {
            type: SLib.TEXT,
            allowNull: true,
            get: function() {
                return this.getDataValue("userData") ?
                    JSON.parse(this.getDataValue("userData"))
                    : null;
            },
            set: function(value) {
                return this.setDataValue("userData", JSON.stringify(value));
            }
        },
        updatedAt: {
            type: SLib.DATE,
            defaultValue: SLib.NOW,
            allowNull: false
        },
        createdAt: {
            type: SLib.DATE,
            allowNull: false,
            defaultValue: SLib.NOW
        },
        deletedAt: {
            type: SLib.DATE,
            allowNull: true
        }
    },
    {
        paranoid: true,
        tableName: "transaction",

        classMethods: {

        }
    }
);
Transaction.belongsTo(Invoice, {foreignKey: "invoiceId"});
Transaction.belongsTo(Account, {foreignKey: "accountId"});