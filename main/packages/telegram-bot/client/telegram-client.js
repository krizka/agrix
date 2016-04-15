/**
 * Created by kriz on 20.07.15.
 */

var TelegramLink = Npm.require('telegram.link')();
var auth = Npm.require('telegram.link');
//var Contacts = Npm.require('telegram.link/lib/contacts');

var Fiber = Npm.require('fibers');
var Future = Npm.require('fibers/future');


var rpcLogger = Npm.require('get-log')('net.RpcChannel');
rpcLogger.debugEnabled = true;


var telegramAppDecription = {
    id: 39449,
    hash: 'a8c710e6e078a7addeca97692d2f489e',
    version: '0.0.1',
    langCode: 'ru',
    deviceModel: 'Linux Server',
    systemVersion: 'Devian/GNU Linux 7.0',
    connectionType: 'TCP'
};

//var wrapFeature(func /*, params */) {
//    var args = _.args(arguments, 1);
//
//}


Meteor.methods({
    telegram_connect (phone) {
        this.unblock();

        var settings = tSettings.get();
        if (!settings.phone) {
            settings = {
                phone: phone,
                connect: telegramAppDecription
            };
        }

        var client = this.connection.telegramClient = new TelegramClient(settings);
        this.connection.onClose(function () {
            client.close();
        });

        client.connect();
        tSettings.update(client.getSettings());
    },

    telegram_reset () {
        var client = this.connection.telegramClient;
        if (client)
            client.close();

        tSettings.update({});
    },

    telegram_check (code) {
        client.signIn(code);
        tSettings.update(client.getSettings());
    }
});

TelegramClient = class TelegramClient {
    create (settings) {
        this._s = _.deepClone(settings);
    }

    close (callback) {
        if (this.client)
            this.client.end(callback);

        this.client = null;
    }

    getSettings () {
        return this._s;
    }

    status () {
        if (this._s.connect.authKey) {
            return 'authorized';
        } else if (this._s.signIn) {
            return 'waitingCode';
        } else {
            return 'connected';
        }
    }

    connect () {
        if (!this._s.connect.authKey) {
            this.auth();
            return;
        }

        var future = new Future;

        var client = TelegramLink.createClient(
            this._s.connect,
            TelegramLink.TEST_PRIMARY_DC,
            function (err, res) {
                if (err) {
                    future.throw(new Meteor.Error(400, 'can\'t connect to telegram with auth key'));
                } else {
                    future.return(client);
                }
            }
        );
        future.wait();

        this.client = client;

        //console.log(client._channel);


        var contacts = new Contacts(client);
        var cont = Meteor.wrapAsync(contacts.getContacts, contacts)('');
        console.log('contacts', cont);

        var api = new TelegramApi(client);
        var state = api.getState().wait();
        console.log('state', state);
    }


    auth () {
        var phone = this._s.phone;
        this._s.signIn = {
            phoneNumber: phone
        };

        console.log('connecting with phone: ' + phone);

        var future = new Future;
        var client = TelegramLink.createClient(
            this._s.connect,
            TelegramLink.TEST_PRIMARY_DC,
            function (err, result) {
                if (err) throw new Meteor.Error('can\'t connect to telegram');
                console.log('connected with result', err, result);
                future.return(result);
            }
        );
        var result = future.wait();

        console.log('Connected to telegram');
        //
        if (!client)
            throw new Meteor.error('Cant connect to telegram');

        this.client = client;

        console.log('before authKey');
        future = new Future;
        client.createAuthKey(function (key) {
            if (!key)
                console.error('callback: AuthKey not retrieved');
            else
                console.log('Auth retrieved', key.toPrintable());
            future.return(key);
        });
        var authKeyLast = future.wait();
        if (!authKeyLast) {
            console.error('AuthKey not retreived');
            return;
        }
        console.log('Telegram authKeyLast', authKeyLast);

        this._s.authKeyLast = authKeyLast;

        try {
            console.log('Client ready', client.isReady(true));

            future = new Future;
            console.log('before send');
            client.auth.sendCode(phone, 5, 'ru', function (res) {
                //console.log('Code sent', res);
                //future.return(res);
                future.return({});
            });
            console.log('after send');

            var res = future.wait();

            this._s.signIn.phoneHash = res.phone_code_hash;

            console.log('Code sent successfully', res);

        } catch (err) {
            console.error('Error while send code', err);
        }
    }

    signIn (checkCode) {
        var future = new Future;
        var signIn = this._s.signIn;

        client.auth.signIn(signIn.phoneNumber, signIn.phoneHash, checkCode, function (res) {
            future.return(res);
        });

        var signInRes = future.wait();

        console.error(signInRes);

        this._s.connect.authKey = this._s.authKeyLast;
        delete this._s.signIn;
        delete this._s.authKeyLast;

        console.log('telegram signed in!');
    }
}

var client;
