import { oneOrNone, one, manyOrNone } from '../../db'
import { ROUTES } from '../../constants'
import { isValidUUID } from '../../helpers'
import { success, reject } from '../'
import {
    getDeleteUserByIdQuery,
    getSelectUserByIdQuery,
    getSelectItemByIdQuery,
    getDeleteAllItemsOfUserQuery,
    getDeleteUserItemQuery,
    getSelectUserItemQuery,
    getDeleteAllItemsFromUserQuery
} from '../../sql-helpers'

export async function deleteUser (req, res) {
    try {
        const id = req.params[ROUTES.USERS.IDp]

        if(!isValidUUID(id)) {
            return reject(res, { id }, `Bad ${[ROUTES.USERS.IDp]} passed`)
        }

        let user = await oneOrNone(getSelectUserByIdQuery(id))
        if(!user) {
            return reject(res, { id }, 'User with passed id does not exist.')
        }

        await manyOrNone(getDeleteAllItemsOfUserQuery(id))

        user = await one(getDeleteUserByIdQuery(id))

        return success(res, { user })
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK')
    }
}

export async function deleteItemFromUser (req, res) {
    try {
        const userId =  req.params[ROUTES.USERS.IDp]
        const itemId =  req.params[ROUTES.ITEMS.IDp]

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${[ROUTES.USERS.IDp]} passed`)
        }

        if(!isValidUUID(itemId)) {
            return reject(res, { itemId }, `Bad ${[ROUTES.ITEMS.IDp]} passed`)
        }

        const user = await oneOrNone(getSelectUserByIdQuery(userId))
        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.')
        }

        const item = await oneOrNone(getSelectItemByIdQuery(itemId))
        if(!item) {
            return reject(res, { itemId }, 'Item with passed id does not exist.')
        }

        const userItem = await oneOrNone(getSelectUserItemQuery(userId, itemId))
        if(!userItem) {
            return reject(res, {}, 'Passed item is not set to this user.')
        }

        const result = await oneOrNone(getDeleteUserItemQuery(userId, itemId))

        return success(res, { result })
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK')
    }
}

export async function deleteAllItemsFromUser (req, res) {
    try {
        const userId =  req.params[ROUTES.USERS.IDp]

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${[ROUTES.USERS.IDp]} passed` )
        }

        const user = await oneOrNone(getSelectUserByIdQuery(userId))

        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.')
        }

        const result = await manyOrNone(getDeleteAllItemsFromUserQuery(userId))

        return success(res, { result })
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK')
    }
}
