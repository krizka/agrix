exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable("raw_request", function (table) {
			table.increments();
			table.integer("user_id").notNullable();
			table.string("hash", 32).notNullable(); //md5
			table.json("raw_data").notNullable();
			table.dateTime("created_at").defaultTo(knex.raw("date('now')")).notNullable();
		}),

		knex.schema.createTable("currency", function (table) {
			table.increments();
			table.string("code", 3).notNullable();
		}),

		knex.schema.createTable("account", function (table) {
			table.increments();
			table.string("owner_id", 20).notNullable();
			table.integer("currency_id").references("id").inTable("currency");
			table.integer("amount").notNullable(); //TODO: deal with numeric field
		}),

		knex.schema.createTable("transaction", function (table) {
			table.increments();
			table.integer("account_id").references("id").inTable("account");
			table.dateTime("created_at").notNullable();
			table.integer("amount").notNullable(); //TODO: deal with numeric field
			table.integer("currency_id").references("id").inTable("currency");
			table.integer("invoice_id").references("id").inTable("invoice"); //TODO: is only invoice group transaction?
			table.json("user_data").notNullable();
		}),

		knex.schema.createTable("invoice", function (table) {
			table.increments();
			table.integer("account_id").references("id").inTable("account");
			table.dateTime("created_at").notNullable();
			table.dateTime("modify_at").notNullable();
			table.integer("amount").notNullable(); //TODO: deal with numeric field
			table.integer("currency_id").references("id").inTable("currency");
			table.json("user_data").notNullable();
		}),

		knex.schema.createTable("exchange_rate", function (table) {
			table.integer("currency_id").references("id").inTable("currency");
			table.date("date").notNullable();
		})

	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable("raw_request"),
		knex.schema.dropTable("currency"),
		knex.schema.dropTable("account"),
		knex.schema.dropTable("transaction"),
		knex.schema.dropTable("invoice"),
		knex.schema.dropTable("exchange_rate")
	]);
};
