import { query } from '../db'
import { TABLES } from '../constants'

async function clear() {
    const list = [
        TABLES.USER_ITEMS.NAME,
        TABLES.ITEMS.NAME,
        TABLES.USERS.NAME
    ]
    const tables = list.map(table => `delete from ${table};`).join('\n')
    try {
        await query(tables)
    } catch (error) {
        console.dir(error)
    } finally {
        process.exit(0)
    }
}

clear()
