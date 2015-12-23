module.exports = {
  //client: 'pg',
  //connection: process.env.DATABASE_URL
  //dev: {
    client: 'pg',
    connection: {
      database: 'finance',
      user:     'root',
      password: 'root'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  //}

};
