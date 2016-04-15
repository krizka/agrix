// Write your package code here!
var http = Npm.require('http');
var https = Npm.require('https');
var Fiber = Npm.require('fibers');

WtTelegram.Bot = class TelegramBot {
    constructor (token) {
        this._token = token || process.env.TELEGRAM_TOKEN;
        check(this._token, String);

        this.lastOffset = 0;
        this.timeout = 60;

        this.baseUrl = 'https://api.telegram.org/bot' + this._token + '/';
        this.fileUrl = 'https://api.telegram.org/file/bot' + this._token + '/';
    }

    connect (handler) {
        this._handler = handler;

        var me = this.method('getMe');
        this.username = '@' + me.username;

        this._connect = true;

        this._pollFiber = Fiber(this._makeLongPoll.bind(this));
        this._pollFiber.run();
    }

    stop () {
        this._pollFiber.reset();
        this._connect = false;
    }

    method (method, param) {
        try {
            var res = HTTP.get(this.baseUrl + method, {
                params: param
            });
            if (res.data && res.data.ok)
                return res.data.result;
            else
                throw new Meteor.Error(res.data.error);
        } catch (e) {
            console.error(e);
            return {};
        }
    }

    download (file) {
        var url = this.makeFileUrl(file);
        console.log('downloading', file, url);
        return HTTP.get(url);
    }

    makeFileUrl(file) {
        return this.fileUrl + file.file_path;
    }

    _makeLongPoll () {
        while (this._connect) {
            var data = this.method('getUpdates', {
                offset: this.lastOffset + 1,
                timeout: this.timeout
            });
            if (data.length > 0)
                this._onData(data);
        }
//        var self = this;
//
//        var request = https.request({
//                host: 'api.telegram.org',
//                port: '443',
//                path: this.pollUrl + self.timeout + '&offset=' + self.offset,
//                method: 'GET',
//                timeout: 120
//            },
//            function (res) {
//                res.on('data', function (chunk) {
//                    var json = JSON.parse(chunk.toString());
//                    self._onData(json);
//                });
//                //res.on('end', function () {
//                //    self._makeLongPoll();
//                //});
//                res.socket.on('close', function () {
//                    self._makeLongPoll();
//                });
//            }
//        );
//
//        request.end();
    }

    _onData (updates) {
        var self = this;

        self.lastOffset = _.last(updates).update_id;
        var messages = _.compact(_.map(updates, (up) => up.message));

        self._handler(messages);
    }

    sendMessage (chatId, msg, opt) {
        var param = _.extend({
            chat_id: chatId,
            text: msg
        }, opt);
        console.log(JSON.stringify(param));
        return this.method('sendMessage', param);
    }
};

