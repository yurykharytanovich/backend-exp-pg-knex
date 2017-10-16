import { one, oneOrNone } from '../../db'
import { TABLES, ROUTES } from '../../constants'
import { isValidUUID, isValidUserUpdate } from '../../helpers'
import { success, reject } from '../'
import _ from 'lodash'
import { getSelectUserByIdQuery, getUpdateUserByIdQuery, getSelectUserByNameQuery } from '../../sql-helpers'

export async function updateUser (req, res) {
    try {
        const id = req.params[ROUTES.USERS.IDp]

        if(!isValidUUID(id)) {
            return reject(res, { id }, `Bad ${ROUTES.USERS.IDp} passed`)
        }

        const user = await oneOrNone(getSelectUserByIdQuery(id))
        if(!user) {
            return reject(res, { id }, `User with passed id does not exist.`)
        }

        const cols = TABLES.USERS.COLUMNS
        const userUpdate = {}
        const putValues = {
            [cols.NAME]: true
        }

        _.keys(req.body).filter(key => putValues[key]).forEach(key => userUpdate[key] = req.body[key])

        const userUpdateValidationInfo = isValidUserUpdate(userUpdate)
        if(userUpdateValidationInfo) {
            return reject(res, { userUpdateValidationInfo }, 'Invalid user data passed.')
        }

        const userWithName = await oneOrNone(getSelectUserByNameQuery(userUpdate[TABLES.USERS.COLUMNS.NAME]))
        if (userWithName) {
            return reject(res, { [TABLES.USERS.COLUMNS.NAME]: userUpdate[TABLES.USERS.COLUMNS.NAME] }, 'Name is already in use.')
        }

        const result = await one(getUpdateUserByIdQuery(id, userUpdate))

        return success(res, { result })
    } catch (error) {
        return reject(res, { error }, 'Update NOT OK')
    }
}
