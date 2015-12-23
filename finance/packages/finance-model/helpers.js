FH = {// FinanceHelpers
    /**
     * String amount to integer converter.
     * toInt(round_up(amount, 2) * 100);
     *
     * @param {string} amount
     * @return integer
     */
    amountToInt: function (amount) {
        var bnAmount = new BN(amount);

        return bnAmount.round(2, BN.ROUND_HALF_CEIL).times(100).toNumber();
    },

    isFunction: function (func) {
        return _.isFunction(func);
    },

    checkClassMethodParams: function (params, callback) {
        check(params, Object);
        check(callback, Match.Where(function (func) { return FH.isFunction(func); }));
    },

    /**
     * Error object to handle check logic errors.
     *
     * @param {int}     status
     * @param {string}  statusString
     * @param {string}  message
     * @constructor
     */
    RequestError: function (status, statusString, message) {
        check(status, Number);
        check(statusString, String);
        check(message, String);

        this.name = "RequestError";
        this.status = status;
        this.statusString = statusString;
        this.message = message;
    }
};