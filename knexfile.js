require('dotenv').config();
module.exports = {
    development: {
        client: 'postgresql',
        connection: process.env.DATABASE_URL || {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            charset: 'utf8',
        },
        migrations: {
            tableName: process.env.DB_MIGR,
        },

    },
};
