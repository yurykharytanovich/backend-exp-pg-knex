import { remove } from '../db/index';
import { TABLES } from '../constants';

export function removeUsers(data) {
    return removeDataFromTable(TABLES.USERS.NAME, data);
}

export function removeItems(data) {
    return removeDataFromTable(TABLES.ITEMS.NAME, data);
}

export function removeUserItems(data) {
    return removeDataFromTable(TABLES.USER_ITEMS.NAME, data);
}

async function removeDataFromTable(table, data) {
    return await remove(table, Object.keys(data).map(key => `id = '${key}'`).join(' or '));
}
