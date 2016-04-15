/**
 * Created by kriz on 20.07.15.
 */


var template;
template = Template['telegram:telegram-connect:admin'];

template.helpers({
    connected: function () {
        var s = tSettings.get();

        var authKey = s.connect ? s.connect.authKey : undefined;
        console.log(authKey);
        return !_.isEmpty(authKey);
    },

    waitingCode: function () {
        var s = tSettings.get();
        return !!s.signIn;
    },

    phoneNumber: function () {
        var s = tSettings.get();

        return s.singIn ? s.singIn.phoneNumber : undefined;
    },

    settings: function () {
        return JSON.stringify(tSettings.get());
    }
});

template.events({
    'submit #telegram-connect': function (event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        var phoneNumber = event.target.phoneNumber.value;

        console.log('calling telegram with ' + phoneNumber);
        Meteor.call('telegram_connect', phoneNumber);

        // Clear form
        event.target.phoneNumber.value = "";
    },

    'submit #telegram-code': function (event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        var checkCode = event.target.checkCode.value;

        Meteor.call('telegram_check', checkCode);

        // Clear form
        event.target.checkCode.value = "";
    },

    'click #cancel': function () {
        Meteor.call('telegram_reset');
    }
});
