import squel from 'squel'
import { TABLES } from '../constants'

const squelPostgres = squel.useFlavour('postgres')

const table = TABLES.ITEMS
const cols = table.COLUMNS

export function getSelectAllItemsQuery() {
    return squel.select()
        .from(table.NAME)
        .toString()
}

export function getSelectItemByIdQuery(id) {
    return squel.select()
        .from(table.NAME)
        .where(`id = '${id}'`)
        .toString()
}

export function getInsertItemQuery(values) {
    return squelPostgres.insert()
        .into(table.NAME)
        .setFields(values)
        .returning('*')
        .toString()
}

export function getDeleteItemByIdQuery(id) {
    return squelPostgres.delete()
        .from(table.NAME)
        .where(`id = '${id}'`)
        .returning('*')
        .toString()
}

export function getUpdateItemByIdQuery(id, values) {
    return squelPostgres.update()
        .table(table.NAME)
        .setFields(values)
        .where(`id = '${id}'`)
        .returning('*')
        .toString()
}

export function getSelectSomeItemsIdsQuery(ids) {
    return squel.select()
        .field('id')
        .from(table.NAME)
        .where(`id in (${ids.map(id => `'${id}'`)})`)
        .toString()
}

export function getSelectItemByNameQuery(name) {
    return squel.select()
        .from(table.NAME)
        .where(`${cols.NAME} = '${name}'`)
        .toString()
}
