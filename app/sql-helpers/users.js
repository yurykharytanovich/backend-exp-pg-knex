import squel from 'squel'
import { TABLES } from '../constants'

const squelPostgres = squel.useFlavour('postgres')

const table = TABLES.USERS
const cols = table.COLUMNS

export function getSelectAllUsersQuery() {
    return squel.select()
        .from(table.NAME)
        .toString()
}

export function getSelectUserByIdQuery(id) {
    return squel.select()
        .from(table.NAME)
        .where(`id = '${id}'`)
        .toString()
}

export function getDeleteUserByIdQuery(id) {
    return squelPostgres.delete()
        .from(table.NAME)
        .where(`id = '${id}'`)
        .returning('*')
        .toString()
}

export function getInsertUserQuery(values) {
    return squelPostgres.insert()
        .into(table.NAME)
        .setFields(values)
        .returning('*')
        .toString()
}

export function getUpdateUserByIdQuery(id, values) {
    return squelPostgres.update()
        .table(table.NAME)
        .setFields(values)
        .where(`id = '${id}'`)
        .returning('*')
        .toString()
}

export function getSelectUserByNameQuery(name) {
    return squel.select()
        .from(table.NAME)
        .where(`${cols.NAME} = '${name}'`)
        .toString()
}
