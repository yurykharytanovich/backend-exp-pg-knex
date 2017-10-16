import { manyOrNone, oneOrNone } from '../../db/index'
import { getSelectAllItemsQuery, getSelectItemByIdQuery } from '../../sql-helpers'
import { success, reject } from '../index'
import { ROUTES } from '../../constants'
import { isValidUUID } from '../../helpers'

export async function getAllItems(req, res) {
    try {
        const items = await manyOrNone(getSelectAllItemsQuery())

        return success(res, { items })
    } catch (error) {
        return reject(res, { error })
    }
}

export async function getItemById(req, res) {
    try {
        const id = req.params[ROUTES.ITEMS.IDp]

        if(!isValidUUID(id)) {
            return reject(res, { id }, `Bad ${[ROUTES.ITEMS.IDp]} passed`)
        }

        const item = await oneOrNone(getSelectItemByIdQuery(id))
        if(!item) {
            return reject(res, { id }, 'Item with passed id does not exist.')
        }

        return success(res, { item })
    } catch (error) {
        return reject(res, { error })
    }
}
