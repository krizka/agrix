/**
 * Created by kriz on 23.07.15.
 */
//     telegram.link
//     Copyright 2014 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://telegram.link


// Dependencies:
var api = Npm.require('telegram.link/lib/api');
var utility = Npm.require('telegram.link/lib/utility');
var Future = Npm.require('fibers/future');



// ***

// This module wraps API methods required to manage the user contacts
// see [Api Methods](https://core.telegram.org/methods)
// Access only via Client object and **contacts** instance property

TelegramApi = function (client) {
    this.client = client;
};

// ***

// **Event: 'methodName'**
// Each of the following methods emits an event with the same name when done, an 'error' event otherwise.


// ***
// contacts.**getContacts(phone_number, phone_code_hash, [callback])**

// Returns the current user's contact list.

// The code:
TelegramApi.prototype._call = function(command /*, params */) {
    var future = new Future;
    utility.callService(command, this.client, this.client._channel, function (err, res) {
        if (err) future.throw(new Meteor.Error(400, 'error calling command ' + command, res));
        else future.return(res);
    }, arguments);
    return future;
};

TelegramApi.prototype.uploadGetFile = function (location, offset, limit) {
    return this._call(api.service.upload.getFile, location, offset, limit);
};

TelegramApi.prototype.getState = function () {
    return this._call(api.service.updates.getState);
};
