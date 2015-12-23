BR = {
    /**
     * Get user token from front by given userId.
     *
     * @throws FH.RequestError
     * @param {string}      userId
     * @param {Function}    callback(error, result)
     */
    getToken: function (userId, callback) {
        //var connection = DDP.connect(Meteor.settings.frontConnectUrl);
        //var token = connection.call("getTokenByUserId", userId);
        //connection.disconnect();

        //callback(null, token);
        callback(null, "sdfjoi23dfsdf");
    },

    /**
     * Generate md5 hash from given string.
     *
     * @param {string} string
     * @returns {string}
     */
    generateHash: function (string) {
        check(string, String);

        return CryptoJS.MD5(string).toString();
    },

    /**
     * Checks if request.body object valid and throws error otherwise.
     *
     * @throws FH.RequestError
     * @param {Object}      data
     * @param {Function}    callback(error, result)
     */
    checkRequest: function (data, callback) {
        if (!data) {
            throw new FH.RequestError(393, "ACCESS-DENIED", "data not received");
        }

        check(data, Match.ObjectIncluding({userId: String, hash: String, data: Object}));

        var wGetToken = Meteor.wrapAsync(BR.getToken);
        var token = wGetToken(data.userId);
        if (!token) {
            throw new FH.RequestError(393, "WRONG-USER", "token not received");
        }

        var rHash = data.hash;
        // hash = md5(concat(token, post.data))
        var gHash = BR.generateHash(token + JSON.stringify(data.data));
        if (rHash !== gHash) {
            throw new FH.RequestError(393, "ACCESS-DENIED", "hash string is wrong");
        }

        callback();
    },

    /**
     * Check DB query error and parse it before send to client.
     *
     * @param {Object} err
     */
    parseDbQueryError: function (err) {
        switch (err.name) {
            case "RequestError":
                break;
            case "SequelizeValidationError":
                err.statusString = "NOT-VALUD";
                err.message = "can not save valid data";

                break;
            case "SequelizeUniqueConstraintError":
                err.statusString = "UNIQUE";
                err.message = "can not create not unique data";

                break;
            case "SequelizeForeignKeyConstraintError":
                err.statusString = "DATA-IN-USE";
                err.message = "can not delete data in use";

                break;
            default:
                console.log("[API error] RequestUnknownError", err);
                err.status = 399;//500;
                err.statusString = "SERVER-ERROR";
                err.message = "unknown error";

                break;
        }
        if (!err.status) { err.status = 399; }

        return {status: err.status, statusString: "WRONG-DATA", message: err.message, data: null};
    },

    /**
     * Make string for standard api response.
     *
     * @param {Object} object
     * @returns {string}
     */
    makeResponseString: function (object) {
        object = object || {};
        check(object, Object);

        return JSON.stringify(_.pick(_.defaults(object, {data: null}), "status", "statusString", "message", "data"));
    },

    /**
     *
     * @param {Object}          object
     * @param {Node.response}   response
     * @return {*|number}
     */
    makeResponse: function (object, response) {
        check(object, Match.ObjectIncluding(
            {status: Number, statusString: String, message: String, data: Match.OneOf(Object, [Object], null)})
        );
        response.statusCode = object.status;

        return response.end(BR.makeResponseString(object));
    },

    /**
     * Save rawRequest to DB. Make error response if fails.
     *
     * @param {string}          method
     * @param {Object}          data
     * @param {Node.response}   response
     * @param {Function}        callback(error, result)
     */
    saveRequest: function (method, data, response, callback) {
        check(method, String);
        check(data, Object);

        var wCreateRawRequest = Meteor.wrapAsync(RawRequest.createRawRequest);

        var result = wCreateRawRequest(
            {userId: data.userId, method: method, hash: data.hash, rawData: data.data, attributes: ["id"]}
        );

        result ? callback(null, result.id) : callback(result, null);
    },

    /**
     * Fill given object by success object fields for standard api response.
     *
     * @param {Object|null} data
     * @return {Object}
     */
    successResponseObject: function (data) {
        data = data || null;
        //check(data, Match.OneOf(Object, null));

        return {status: 200, statusString: "REQUEST-OK", message: "request success", data: data};
    },

    /**
     * Checks request.body, saves it to DB and send error response to client otherwise.
     *
     * @param {Node.request}    request
     * @param {Node.response}   response
     * @param {Function}        method
     * @param {Object}          methodParams
     * @param {boolean}         transaction
     */

    start: function (request, response, method, methodParams, transaction) {
        try {
            var wCheckRequest = Meteor.wrapAsync(BR.checkRequest);
            wCheckRequest(request.body);

            var wSaveRequest = Meteor.wrapAsync(BR.saveRequest);
            var rawRequestId = wSaveRequest(request.url, request.body, response);
        } catch (err) {
            return BR.makeResponse(BR.parseDbQueryError(err), response);
        }

        var responseObj;
        try {
            check(rawRequestId, Number);
            // fill methodParams blank object by request.body data
            _.each(methodParams, function (value, key) {
                if (_.indexOf(["attributes", "raw", "order", "limit", "offset", "group"], key) === -1) {
                    methodParams[key] = request.body.data[key]
                }
            });

            // every model classMethod gets userId field as parameter
            methodParams.userId = request.body.userId;
            // and run ORM method
            var wMethodResult;
            if (transaction) {
                var wTransaction = Meteor.wrapAsync(BR.makeTransaction);
                wMethodResult = wTransaction(method, methodParams);
            } else {
                var wMethod = Meteor.wrapAsync(method);
                wMethodResult = wMethod(methodParams);
            }

            responseObj = BR.successResponseObject(wMethodResult);
        } catch (err) {
            responseObj = BR.parseDbQueryError(err);
        }

        return BR.end(responseObj, rawRequestId, response)
    },

    /**
     * Updates rawRequest response field and send response to client.
     *
     * @param {string}          responseObject
     * @param {integer}         rawRequestId
     * @param {Node.response}   response
     */
    end: function (responseObject, rawRequestId, response) {
        check(responseObject, Object);
        check(rawRequestId, Number);
        var wUpdateRawRequest = Meteor.wrapAsync(RawRequest.updateRawRequest);
        wUpdateRawRequest({object: responseObject, id: rawRequestId});

        return BR.makeResponse(responseObject, response);
    },

    makeTransaction: function (method, methodParams, callback) {
        return Sequelize.transaction(function (t) {
            methodParams.transaction = t;
            method(methodParams, callback);
        }).then(function (result) {
            return callback(null, result);
        }).catch(function (err) {
            return callback(err, null);
        });
    }
};

// request data
// {userId: <mongoId>, hash: <hashStr>, data: <data obj>}
