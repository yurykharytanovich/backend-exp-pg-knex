require('dotenv').config();
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      charset: 'utf8'
    },
    migrations: {
      tableName: process.env.DB_MIGR
    }

  },

  staging: {
    client: 'postgresql',
    connection: {
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: process.env.DB_MIGR
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: process.env.DB_MIGR
    }
  }
};
