/**
 * Created by kriz on 20.07.15.
 */


TelegramSettings = new Meteor.Collection('settings');

if (Meteor.isServer) {
    Meteor.publish('settings', function () {
        return TelegramSettings.find();
    });
}
var TSettings = function () {
    var settings = TelegramSettings.findOne({ type: 'telegram' });
    if (!settings && Meteor.isServer)
        TelegramSettings.insert({ type: 'telegram', s: {} });
};

TSettings.prototype.update = function (settings) {
    console.log('Updating settings', settings);
    TelegramSettings.update({ _id: this.get()._id }, { $set: { s: settings } });
};

TSettings.prototype.get = function () {
    var one = TelegramSettings.findOne({ type: 'telegram' });
    return one && one.s ? one.s : {};
};


tSettings = null;
Meteor.startup(function () {
    tSettings = new TSettings();
    if (Meteor.isClient) {
        Meteor.subscribe('settings');
    }
    WtTelegram.settings = tSettings;
});

