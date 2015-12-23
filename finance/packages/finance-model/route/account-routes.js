// {data: {userId: <userId>}}
Router.route("/api/v1/account/list", { where: "server", name: "account.list" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Account.getUserAccounts,
            {userId: "userId", attributes: ["id", "amount"], raw: true}
        );
    });

// {data: {userId: userId, currencyId: <currencyId>}}
Router.route("/api/v1/account/new", { where: "server", name: "account.new" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Account.createAccount,
            {userId: "userId", currencyId: "currencyId", attributes: ["id", "amount", "currencyId"]}
        );
    });

// {data: {userId: userId, currencyId: <currencyId>}}
Router.route("/api/v1/account/delete", { where: "server", name: "account.delete" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Account.deleteAccount,
            {userId: "userId", accountId: "accountId", attributes: ["id"]}
        );
    });

// {data: {userId: userId, fromAccountId: <accountId>, toAccountId: <accountId>, amount: <amount>}}
Router.route("/api/v1/account/transfer", { where: "server", name: "account.transfer" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Account.transferBTAccounts,
            //Account.checkTransferAbility,
            {userId: "userId", fromAccountId: "fromAccountId", toAccountId: "toAccountId", amount: "amount"}
        );
    });