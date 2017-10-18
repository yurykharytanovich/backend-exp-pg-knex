import {
    one,
    oneOrNone,
    manyOrNone,
} from '../db';

import {
    getSelectUserByIdQuery,
    getSelectAllUsersQuery,
    getSelectUserByNameQuery,
    getInsertUserQuery,
    getUpdateUserByIdQuery,
    getDeleteUserByIdQuery,

    getSelectUserItemQuery,
    getSelectAllItemsOfUserQuery,
    getSelectItemsOfUserByItemsIdsQuery,
    getInsertUserItemsQuery,
    getDeleteUserItemQuery,
    getDeleteAllUserItemsByUserIdQuery,
} from '../sql-helpers';

import { formatItemsForAddingToUser } from '../formatters';
//User services
export function getUser(id) {
    return oneOrNone(getSelectUserByIdQuery(id));
}

export function getUserByName(userName) {
    return oneOrNone(getSelectUserByNameQuery(userName));
}

export function getAllUsers() {
    return manyOrNone(getSelectAllUsersQuery());
}

export function addUser(data) {
    return one(getInsertUserQuery(data));
}

export function updateUser(id, update) {
    return one(getUpdateUserByIdQuery(id, update));
}

export function deleteUser(id) {
    return one(getDeleteUserByIdQuery(id));
}

//Items of Users services

export function getItemOfUser(userId, itemId) {
    return oneOrNone(getSelectUserItemQuery(userId, itemId));
}

export function getItemsOfUserByIds(userId, itemIds) {
    return manyOrNone(getSelectItemsOfUserByItemsIdsQuery(userId, itemIds));
}

export function getAllItemsOfUser(userId) {
    return manyOrNone(getSelectAllItemsOfUserQuery(userId));
}

export function addItemsToUser(userId, itemsIds) {
    return manyOrNone(getInsertUserItemsQuery(formatItemsForAddingToUser(userId, itemsIds)));
}

export function deleteItemOfUser(userId, itemId) {
    return oneOrNone(getDeleteUserItemQuery(userId, itemId));
}

export function deleteAllItemsOfUser(userId) {
    return manyOrNone(getDeleteAllUserItemsByUserIdQuery(userId));
}



