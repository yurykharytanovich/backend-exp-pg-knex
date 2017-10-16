import squel from 'squel'
import { TABLES } from '../constants'

const squelPostgres = squel.useFlavour('postgres')

const table = TABLES.USER_ITEMS
const cols = table.COLUMNS

export function getDeleteAllUsersOfItemQuery(itemId) {
    return squelPostgres.delete()
        .from(table.NAME)
        .where(`${cols.ITEM_ID} = '${itemId}'`)
        .returning('*')
        .toString()
}

export function getDeleteAllItemsOfUserQuery(userId) {
    return squelPostgres.delete()
        .from(table.NAME)
        .where(`${cols.USER_ID} = '${userId}'`)
        .returning('*')
        .toString()
}

export function getSelectUserItemQuery(userId, itemId) {
    return squelPostgres.select()
        .from(table.NAME)
        .where(`${cols.USER_ID} = '${userId}'`)
        .where(`${cols.ITEM_ID} = '${itemId}'`)
        .toString()
}

export function getDeleteUserItemQuery(userId, itemId) {
    return squelPostgres.delete()
        .from(table.NAME)
        .where(`${cols.USER_ID} = '${userId}'`)
        .where(`${cols.ITEM_ID} = '${itemId}'`)
        .returning('*')
        .toString()
}

export function getSelectAllItemsOfUserQuery(userId) {
    return squel.select()
        .field(cols.USER_ID)
        .field(`${TABLES.USERS.NAME}.${TABLES.USERS.COLUMNS.NAME}`,`${TABLES.USERS.NAME}_${TABLES.USERS.COLUMNS.NAME}`)
        .field(cols.ITEM_ID)
        .field(`${TABLES.ITEMS.NAME}.${TABLES.ITEMS.COLUMNS.NAME}`,`${TABLES.ITEMS.NAME}_${TABLES.ITEMS.COLUMNS.NAME}`)
        .from(TABLES.USERS.NAME)
        .join(table.NAME, null, `${table.NAME}.${cols.USER_ID} = ${TABLES.USERS.NAME}.id`)
        .join(TABLES.ITEMS.NAME, null, `${TABLES.ITEMS.NAME}.id = ${table.NAME}.${cols.ITEM_ID}`)
        .where(`${TABLES.USERS.NAME}.id = '${userId}'`)
        .toString()
}

export function getSelectUserItemsByIdsQuery(userId, itemsIds) {
    return squel.select()
        .from(table.NAME)
        .where(`${cols.USER_ID} = '${userId}'`)
        .where(`${cols.ITEM_ID} in (${itemsIds.map(id => `'${id}'`)})`)
        .toString()
}

export function getInsertUserItemsQuery(values) {
    return squelPostgres.insert()
        .into(table.NAME)
        .setFieldsRows(values)
        .returning('*')
        .toString()
}

export function getDeleteAllItemsFromUserQuery(userId) {
    return squelPostgres.delete()
        .from(table.NAME)
        .where(`${cols.USER_ID} = '${userId}'`)
        .returning('*')
        .toString()
}

export function getSelectAllUserItemsQuery() {
    return squel.select()
        .from(table.NAME)
        .toString()
}
