import { success, reject } from '../index'
import { isValidItem } from '../../helpers/data-validation'
import { formatItemForInsertion } from '../../formatters/items'
import { one, oneOrNone } from '../../db'
import { getInsertItemQuery, getSelectItemByNameQuery } from '../../sql-helpers/items'
import { TABLES } from '../../constants/tables'

export async function addItem (req, res) {
    try {
        const itemValidationInfo = isValidItem(req.body.item)
        if(itemValidationInfo) {
            return reject(res, { itemValidationInfo }, 'Invalid item data passed.')
        }

        const itemWithName = await oneOrNone(getSelectItemByNameQuery(req.body.item[TABLES.ITEMS.COLUMNS.NAME]))
        if (itemWithName) {
            return reject(res, { [TABLES.ITEMS.COLUMNS.NAME]: req.body.item[TABLES.ITEMS.COLUMNS.NAME] }, 'Name is already in use.')
        }

        const values = formatItemForInsertion(req.body.item)
        const item = await one(getInsertItemQuery(values))

        return success(res, { item })
    } catch (error) {
        return reject(res, { error }, 'Insert NOT OK')
    }
}
