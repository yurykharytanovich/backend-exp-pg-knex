import { TABLES, ROUTES } from '../../constants'
import { success, reject } from '../index'
import { isValidUser, isValidUUID, isValidUUIDsArray } from '../../helpers'
import { formatUserForInsertion, formatUserItemsForInsertion } from '../../formatters'
import { one, oneOrNone, manyOrNone } from '../../db'
import {
    getInsertUserQuery,
    getSelectUserByIdQuery,
    getSelectSomeItemsIdsQuery,
    getInsertUserItemsQuery,
    getSelectUserItemsByIdsQuery,
    getSelectUserByNameQuery
} from '../../sql-helpers'

export async function addUser (req, res) {
    try {
        const userValidationInfo = isValidUser(req.body.user)
        if(userValidationInfo) {
            return reject(res, { userValidationInfo }, 'Invalid user data passed.')
        }

        const userWithName = await oneOrNone(getSelectUserByNameQuery(req.body.user[TABLES.USERS.COLUMNS.NAME]))
        if (userWithName) {
            return reject(res, { [TABLES.USERS.COLUMNS.NAME]: req.body.user[TABLES.USERS.COLUMNS.NAME] }, 'Name is already in use.')
        }

        const values = formatUserForInsertion(req.body.user)
        const user = await one(getInsertUserQuery(values))

        return success(res, { user })
    } catch (error) {
        return reject(res, { error }, 'Insert NOT OK')
    }
}

export async function addItemsToUser (req, res) {
    try {
        const userId = req.params[ROUTES.USERS.IDp]

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${[ROUTES.USERS.IDp]} passed`)
        }

        if(!isValidUUIDsArray(req.body.itemsIds)) {
            return reject(res, {}, 'Invalid items ids.')
        }

        const user = await oneOrNone(getSelectUserByIdQuery(userId))
        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.')
        }

        if(req.body.itemsIds.length === 0) {
            return success(res, { userItems: [] })
        }

        const itemsIdsFromBase = await manyOrNone(getSelectSomeItemsIdsQuery(req.body.itemsIds))
        if(itemsIdsFromBase.length !== req.body.itemsIds.length) {
            const map = {}
            itemsIdsFromBase.forEach(id => map[id.id] = true)
            const absentIds = req.body.itemsIds.filter(id => !map[id])

            return reject(res, { absentIds }, 'Some of items ids are not presented in db.')
        }

        const userItemsFromBase = await manyOrNone(getSelectUserItemsByIdsQuery(userId, req.body.itemsIds))

        if(userItemsFromBase.length > 0) {
            const itemsMap = {}
            userItemsFromBase.forEach(userItem =>
                itemsMap[userItem[TABLES.USER_ITEMS.COLUMNS.ITEM_ID]] = true
            )
            const addedItemsIds = req.body.itemsIds.filter(id => itemsMap[id])

            return reject(res, { addedItemsIds }, 'Some of items ids are already added to user.')
        }

        const values = formatUserItemsForInsertion(userId, req.body.itemsIds)
        const result = await manyOrNone(getInsertUserItemsQuery(values))

        return success(res, { userItems: result })
    } catch (error) {
        return reject(res, { error }, 'Insert NOT OK')
    }
}
