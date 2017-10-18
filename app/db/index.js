import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();

const dbUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const db = pgp(dbUrl);

export function query(query) {
    return db.query(query);
}

export function many(query) {
    return db.many(query);
}

export function one(query) {
    return db.one(query);
}

export function none(query) {
    return db.none(query);
}

export function oneOrNone(query) {
    return db.oneOrNone(query);
}

export function manyOrNone(query) {
    return db.manyOrNone(query);
}

export function insert(table, columns, values) {
    const cs = new pgp.helpers.ColumnSet(columns, {table});
    const query = pgp.helpers.insert(values, cs);

    return db.many(query + 'RETURNING *');
}

export function remove(table, condition) {
    return db.query(`delete from ${table} where ${condition}`);
}
