import { none } from '../db'
import { TABLES } from '../constants'

export function checkUsers(data) {
    return checkDataInTable(TABLES.USERS.NAME, data)
}

export function checkItems(data) {
    return checkDataInTable(TABLES.ITEMS.NAME, data)
}

export function checkUserItems(data) {
    return checkDataInTable(TABLES.USER_ITEMS.NAME, data)
}

async function checkDataInTable(table, data) {
    return await none(`select * from ${table} where ${Object.keys(data).map(key => `id = '${key}'`).join(' or ')}`)
}
