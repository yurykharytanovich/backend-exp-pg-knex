import { TABLES } from '../constants'

const cols = TABLES.USERS.COLUMNS

export function formatUserForInsertion(user) {
    user = {
        [cols.NAME]: user[cols.NAME]
    }

    return user
}
