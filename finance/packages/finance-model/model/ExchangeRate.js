ExchangeRate = Sequelize.define("exchangeRate",
    {
        id: {
            type: SLib.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fromCurrencyId: {
            type: SLib.INTEGER,
            allowNull: false,
            references: {
                model: Currency
            }
        },
        toCurrencyId: {
            type: SLib.INTEGER,
            allowNull: false,
            references: {
                model: Currency
            }
        },
        rate: {
            type: SLib.INTEGER,
            allowNull: false
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
            allowNull: false,
            defaultValue: SLib.NOW
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
        tableName: "exchangeRate"
    }
);