import { TABLES } from '../constants';

const cols = TABLES.USERS.COLUMNS;

export function formatUserForAdding(user) {
    user = {
        [cols.NAME]: user[cols.NAME],
    };

    return user;
}
