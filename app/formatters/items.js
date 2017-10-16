import { TABLES } from '../constants'

const cols = TABLES.ITEMS.COLUMNS

export function formatItemForInsertion(item) {
    item = {
        [cols.NAME]: item[cols.NAME]
    }

    return item
}
