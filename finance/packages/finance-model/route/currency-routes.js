// {data: {userId: <userId>}}
Router.route("/api/v1/currency/list", { where: "server", name: "currency.list" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Currency.getCurrencyList,
            {attributes: ["id", "code"], raw: true}
        );
    });

// {data: {currencyId: <currencyId>}}
Router.route("/api/v1/currency/new", { where: "server", name: "currency.new" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Currency.addCurrency,
            {currencyCode: "currencyCode", attributes: ["id", "code"]}
        );
    });

// {data: {currencyId: <currencyId>}}
Router.route("/api/v1/currency/delete", { where: "server", name: "currency.delete" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Currency.deleteCurrency,
            {currencyId: "currencyId"}
        );
    });