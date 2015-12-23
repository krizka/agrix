ExchangeRate = Sequelize.define("exchangeRateHistory",
    {
        id: {
            type: SLib.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fromCurrency: {
            type: SLib.STRING(3),
            allowNull: false
        },
        toCurrency: {
            type: SLib.STRING(3),
            allowNull: false
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
        tableName: "exchangeRateHistory"
    }
);