// test enter point
Router.route("/", { name: "finance.test" })
    .get(function () {
        return this.render("FinanceTest");
    });