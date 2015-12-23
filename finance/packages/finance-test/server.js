CR = {
    method: 'POST',

    url () {
        return Meteor.absoluteUrl() + '/api/v1/';
    },

    /**
     * HTTP wrap
     *
     * @param {string} path
     * @param {Object} data
     * @return {*}
     */
    httpCall (path, data)
    {
        console.log('[httpCall][start]', path, data);
        try {
            let wrappedGetToken = Meteor.wrapAsync(CR.getToken);
            const token = wrappedGetToken(data.userId);

            data.hash = CR.generateHash(token + JSON.stringify(data.data));

            let result = HTTP.call(CR.method, CR.url() + path, { data: data });

            console.log('[httpCall][end]', path, result.content);

            let content = JSON.parse(result.content);

            return content.status !== 200 ? content : content.data;
        } catch (e) {
            console.log('[httpCall][error]', path, e);

            return 'request failed...';
        }
    },

    getToken (userId, callback) {
        return callback('sdfjoi23dfsdf');

        //const connection = DDP.connect(Meteor.settings.frontConnectUrl);
        //const token = connection.call('getTokenByUserId', userId);
        //connection.disconnect();
        //let error = null;
        //if (!token) { error = 'token not received'; }
        //
        //callback(error, token);
    },

    generateHash (string) {
        return CryptoJS.MD5(string).toString();
    }
};

Meteor.methods({
    accountList (userId) {
        return CR.httpCall('account/list', { userId: userId, data: { userId: userId } });
    },

    /**
     *
     * @param {string}  userId
     * @param {integer} currencyId
     * @return {*}
     */
    accountNew (userId, currencyId) {
        return CR.httpCall('account/new', { userId: userId, data: { currencyId: +currencyId } });
    },

    /**
     *
     * @param {string}  userId
     * @param {integer} accountId
     * @return {*}
     */
    accountDelete (userId, accountId) {
        return CR.httpCall('account/delete', { userId: userId, data: { accountId: +accountId } });
    },

    /**
     *
     * @param {string}  userId
     * @param {integer} fromAccountId
     * @param {integer} toAccountId
     * @param {string}  amount
     * @return {*}
     */
    accountTransfer (userId, fromAccountId, toAccountId, amount) {
        return CR.httpCall(
            'account/transfer',
            { userId: userId, data: { fromAccountId: +fromAccountId, toAccountId: +toAccountId, amount: amount } }
        );
    },

    /**
     *
     * @param {string} userId
     * @return {*}
     */
    currencyList (userId) {
        return CR.httpCall('currency/list', { userId: userId, data: { userId: userId } });
    },

    /**
     *
     * @param {string} userId
     * @param {string} currencyCode
     * @return {*}
     */
    currencyNew (userId, currencyCode) {
        return CR.httpCall('currency/new', { userId: userId, data: { currencyCode: currencyCode } });
    },

    /**
     *
     * @param {string} userId
     * @param {string} currencyId
     * @return {*}
     */
    currencyDelete (userId, currencyId) {
        return CR.httpCall('currency/delete', { userId: userId, data: { currencyId: +currencyId } });
    },

    /**
     *
     * @param userId
     * @return {*}
     */
    invoiceList (userId) {
        return CR.httpCall('invoice/list', { userId: userId, data: { userId: userId } });
    },

    /**
     *
     * @param userId
     * @param payToId
     * @param amount
     * @return {*}
     */
    invoiceNew (userId, payToId, amount) {
        return CR.httpCall('invoice/new', { userId: userId, data: { payToId: +payToId, amount: amount } });
    },

    /**
     *
     * @param userId
     * @param invoiceId
     * @return {*}
     */
    invoiceDelete (userId, invoiceId) {
        return CR.httpCall('invoice/delete', { userId: userId, data: { invoiceId: +invoiceId } });
    },

    /**
     *
     * @param userId
     * @param invoiceId
     * @return {*}
     */
    invoicePay (userId, invoiceId) {
        return CR.httpCall('invoice/pay', { userId: userId, data: { invoiceId: +invoiceId } });
    }
});
