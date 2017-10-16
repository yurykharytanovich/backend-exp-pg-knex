import { manyOrNone, oneOrNone } from '../../db/index'
import { getSelectUserByIdQuery, getSelectAllItemsOfUserQuery, getSelectAllUsersQuery } from '../../sql-helpers'
import { success, reject } from '../index'
import { ROUTES } from '../../constants'
import { isValidUUID } from '../../helpers'

export async function getAllUsers(req, res) {
    try {
        const users = await manyOrNone(getSelectAllUsersQuery())

        return success(res, { users })
    } catch (error) {
        return reject(res, { error })
    }
}

export async function getUserById(req, res) {
    try {
        const id = req.params[ROUTES.USERS.IDp]

        if(!isValidUUID(id)) {
            return reject(res, { id }, `Bad ${[ROUTES.USERS.IDp]} passed`)
        }

        const user = await oneOrNone(getSelectUserByIdQuery(id))
        if(!user) {
            return reject(res, { id }, 'User with passed id does not exist.')
        }

        return success(res, { user })
    } catch (error) {
        return reject(res, { error })
    }
}

export async function getAllItemsOfUser(req, res) {
    try {
        const id =  req.params[ROUTES.USERS.IDp]

        if(!isValidUUID(id)) {
            return reject(res, { id }, `Bad ${[ROUTES.USERS.IDp]} passed`)
        }

        const user = await oneOrNone(getSelectUserByIdQuery(id))
        if(!user) {
            return reject(res, { id }, 'User with passed id does not exist.')
        }

        const userItems = await manyOrNone(getSelectAllItemsOfUserQuery(id))

        return success(res, { userItems })
    } catch (error) {
        console.log(error)
        return reject(res, { error })
    }
}
