import { oneOrNone, one, manyOrNone } from '../../db'
import { ROUTES } from '../../constants'
import { isValidUUID } from '../../helpers'
import { success, reject } from '../'
import { getDeleteItemByIdQuery, getDeleteAllUsersOfItemQuery } from '../../sql-helpers'
import { getSelectItemByIdQuery } from '../../sql-helpers/items'

export async function deleteItem (req, res) {
    try {
        const id = req.params[ROUTES.ITEMS.IDp]

        if(!isValidUUID(id)) {
            return reject(res, { id }, `Bad ${[ROUTES.ITEMS.IDp]} passed`)
        }

        let item = await oneOrNone(getSelectItemByIdQuery(id))
        if(!item) {
            return reject(res, { id }, 'Item with passed id does not exist.')
        }

        item = await one(getDeleteItemByIdQuery(id))

        return success(res, { item })
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK')
    }
}
