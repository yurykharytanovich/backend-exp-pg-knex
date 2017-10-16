import { TABLES } from '../constants'

const table = TABLES.USER_ITEMS
const cols = table.COLUMNS

export function formatUserItemsForInsertion(userId, itemsIds) {
    return itemsIds.map(itemId => ({
        [cols.USER_ID]: userId,
        [cols.ITEM_ID]: itemId
    }))
}
