import { one, oneOrNone } from '../../db'
import { TABLES, ROUTES } from '../../constants'
import { isValidUUID, isValidItemUpdate } from '../../helpers'
import { success, reject } from '../'
import _ from 'lodash'
import { getSelectItemByIdQuery, getUpdateItemByIdQuery, getSelectItemByNameQuery } from '../../sql-helpers'

export async function updateItem (req, res) {
    try {
        const id = req.params[ROUTES.ITEMS.IDp]

        if(!isValidUUID(id)) {
            return reject(res, { id }, `Bad ${ROUTES.ITEMS.IDp} passed`)
        }

        const item = await oneOrNone(getSelectItemByIdQuery(id))
        if(!item) {
            return reject(res, { id }, `Item with passed id does not exist.`)
        }

        const cols = TABLES.ITEMS.COLUMNS
        const itemUpdate = {}
        const putValues = {
            [cols.NAME]: true
        }

        _.keys(req.body).filter(key => putValues[key]).forEach(key => itemUpdate[key] = req.body[key])

        const itemUpdateValidationInfo = isValidItemUpdate(itemUpdate)
        if(itemUpdateValidationInfo) {
            return reject(res, { itemUpdateValidationInfo }, 'Invalid item data passed.')
        }

        const itemWithName = await oneOrNone(getSelectItemByNameQuery(itemUpdate[TABLES.ITEMS.COLUMNS.NAME]))
        if (itemWithName) {
            return reject(res, { [TABLES.ITEMS.COLUMNS.NAME]: itemUpdate[TABLES.ITEMS.COLUMNS.NAME] }, 'Name is already in use.')
        }

        const result = await one(getUpdateItemByIdQuery(id, itemUpdate))

        return success(res, { result })
    } catch (error) {
        return reject(res, { error }, 'Update NOT OK')
    }
}
