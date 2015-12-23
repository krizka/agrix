// {data: {userId: <userId>}}
Router.route("/api/v1/invoice/list", { where: "server", name: "invoice.list" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Invoice.getUserInvoice,
            {userId: "userId", attributes: ["id", "amount"], raw: true}
        );
    });

// {data: {userId: <userId>, currencyId: <currencyId>, amount: <amount>}
Router.route("/api/v1/invoice/new", { where: "server", name: "invoice.new" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Invoice.createInvoice,
            {userId: "userId", payToId: "payToId", amount: "amount", attributes: ["id", "amount"]}
        );
    });

// {data: {currencyId: <currencyId>}}
Router.route("/api/v1/invoice/delete", { where: "server", name: "invoice.delete" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Invoice.deleteInvoice,
            {userId: "userId", invoiceId: "invoiceId"}
        );
    });

// {data: {userId: <userId>, invoiceId: <invoiceId>, accountId: <accountId>}}
Router.route("/api/v1/invoice/pay", { where: "server", name: "invoice.pay" })
    .post(function () {
        return BR.start(
            this.request,
            this.response,
            Invoice.payInvoice,
            {userId: "userId", invoiceId: "invoiceId", accountId: "accountId"}
        );
    });