function wrapCallResult(error, result, methodName) {
    if (error) {
        console.log("[error] " + methodName, error);
    }
    if (result) {
        console.log("[result] " + methodName, result);
        Session.set(methodName, result);
    }
}

function emptyParam () {
    console.log("[error] empty param field");

    return false;
}

Template.accountTest.helpers({
    accountList: function () {
        return Session.get("accountList");
    },

    currencyList: function () {
        return Session.get("currencyList");
    }
});

Template.currencyTest.helpers({
    currencyList: function () {
        return Session.get("currencyList");
    }
});

Template.invoiceTest.helpers({
    invoiceList: function () {
        return Session.get("invoiceList");
    },

    currencyList: function () {
        return Session.get("currencyList");
    },

    accountList: function () {
        return Session.get("accountList");
    }
});

Template.accountTest.events({
    "click #do-account-list-button": function (event, template) {
        var userId = template.find(".user-id-input").value;
        if (!userId) { return emptyParam(); }

        Meteor.call("accountList", userId, function (error, result) {
            wrapCallResult(error, result, "accountList");
        });
    },

    "click #do-account-new-button": function (event, template) {
        var userId = template.find(".user-id-input").value;
        var currencyId = template.find("#account-currency-choice").value;
        if (!userId || !currencyId) { return emptyParam(); }

        Meteor.call("accountNew", userId, currencyId, function (error, result) {
            wrapCallResult(error, result, "accountNew");
            if (result) {
                Meteor.call("accountList", userId, function (error, result) {
                    wrapCallResult(error, result, "accountList");
                });
            }
        });
    },

    "click .do-account-remove-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        var accountId = event.target.getAttribute("data-id");
        if (!accountId || !userId) { return emptyParam(); }

        Meteor.call("accountDelete", userId, accountId, function (error, result) {
            wrapCallResult(error, result, "accountDelete");
            if (result) {
                Meteor.call("accountList", userId, function (error, result) {
                    wrapCallResult(error, result, "accountList");
                });
            }
        });
    },

    "click .do-account-transfer-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        var fromAccountId = event.target.getAttribute("data-id");
        var toAccountId = template.find("#transfer-to-account-id-input-" + fromAccountId).value;
        var amount = template.find("#transfer-amount-input-" + fromAccountId).value;
        if (!toAccountId || !amount || !userId) { return emptyParam();}

        Meteor.call("accountTransfer", userId, fromAccountId, toAccountId, amount, function (error, result) {
            wrapCallResult(error, result, "accountTransfer");
            if (result) {
                Meteor.call("accountList", userId, function (error, result) {
                    wrapCallResult(error, result, "accountList");
                });
            }
        });
    }
});

Template.currencyTest.events({
    "click #do-currency-list-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        if (!userId) { return emptyParam(); }

        Meteor.call("currencyList", userId, function (error, result) {
            wrapCallResult(error, result, "currencyList");
        });
    },

    "click #do-currency-new-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        var currencyCode = template.find("#currency-code-input").value;
        if (!userId || !currencyCode) { return emptyParam(); }

        Meteor.call("currencyNew", userId, currencyCode, function (error, result) {
            wrapCallResult(error, result, "currencyNew");
            if (result) {
                Meteor.call("currencyList", userId, function (error, result) {
                    wrapCallResult(error, result, "currencyList");
                });
            }
        });
    },

    "click .do-currency-delete-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        var currencyId = event.target.getAttribute("data-id");
        if (!userId) { return emptyParam(); }

        Meteor.call("currencyDelete", userId, currencyId, function (error, result) {
            wrapCallResult(error, result, "currencyDelete");
            if (result) {
                Meteor.call("currencyList", userId, function (error, result) {
                    wrapCallResult(error, result, "currencyList");
                });
            }
        });
    }
});

Template.invoiceTest.events({
    "click #do-invoice-new-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        var payToId = template.find("#invoice-pay-to-id-select").value;
        var amount = template.find("#invoice-amount-input").value;
        if (!userId || !payToId || !amount) { return emptyParam(); }

        Meteor.call("invoiceNew", userId, payToId, amount, function (error, result) {
            wrapCallResult(error, result, "invoiceNew");
            if (result) {
                Meteor.call("invoiceList", userId, function (error, result) {
                    wrapCallResult(error, result, "invoiceList");
                });
            }
        });
    },

    "click #do-invoice-list-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        if (!userId) { return emptyParam(); }

        Meteor.call("invoiceList", userId, function (error, result) {
            wrapCallResult(error, result, "invoiceList");
        });
    },

    "click #do-invoice-delete-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        var invoiceId = event.target.getAttribute("data-id");
        if (!userId || !invoiceId) { return emptyParam(); }

        Meteor.call("invoiceDelete", userId, invoiceId, function (error, result) {
            wrapCallResult(error, result, "invoiceDelete");
            if (result) {
                Meteor.call("invoiceList", userId, function (error, result) {
                    wrapCallResult(error, result, "invoiceList");
                });
            }
        });
    },

    "click #do-invoice-pay-button": function (event, template) {
        event.preventDefault();
        var userId = template.find(".user-id-input").value;
        var invoiceId = event.target.getAttribute("data-id");
        if (!userId || !invoiceId) { return emptyParam(); }

        Meteor.call("invoicePay", userId, invoiceId, function (error, result) {
            wrapCallResult(error, result, "invoicePay");
            if (result) {
                Meteor.call("invoiceList", userId, function (error, result) {
                    wrapCallResult(error, result, "invoiceList");
                });
            }
        });
    }
});