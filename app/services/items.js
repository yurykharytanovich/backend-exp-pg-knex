import {
    manyOrNone,
    oneOrNone,
    one,
} from '../db/index';
import {
    getSelectItemByIdQuery,
    getSelectItemByNameQuery,
    getSelectAllItemsQuery,
    getSelectItemsByIdsQuery,
    getInsertItemQuery,
    getUpdateItemByIdQuery,
    getDeleteItemByIdQuery,
    getDeleteAllUserItemsByItemIdQuery,
} from '../sql-helpers';

export function getItem(id) {
    return oneOrNone(getSelectItemByIdQuery(id));
}

export function getItemByName(itemName) {
    return oneOrNone(getSelectItemByNameQuery(itemName));
}

export function getAllItems() {
    return manyOrNone(getSelectAllItemsQuery());
}

export function getItemsByIds(ids) {
    return manyOrNone(getSelectItemsByIdsQuery(ids));
}

export function addItem(data) {
    return one(getInsertItemQuery(data));
}

export function updateItem(id, update) {
    return one(getUpdateItemByIdQuery(id, update));
}

export function deleteItemFromAllUsers(itemId) {
    return manyOrNone(getDeleteAllUserItemsByItemIdQuery(itemId));
}
export function deleteItem(id) {
    return one(getDeleteItemByIdQuery(id));
}

