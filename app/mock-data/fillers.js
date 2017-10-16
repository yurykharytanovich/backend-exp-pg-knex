import * as generators from './data-generators'
import { TABLES } from '../constants'
import { insert, many } from '../db/index'
import { getSelectAllUsersQuery, getSelectAllItemsQuery } from '../sql-helpers'
import { getSelectAllUserItemsQuery } from '../sql-helpers/user_items'

//configurable fillers
export async function fillUsers(N) {
    const users = generators.getUsers(N)
    const table = TABLES.USERS
    const cols = table.COLUMNS
    const columns = [
        cols.NAME
    ]

    await insert(
        table.NAME,
        columns,
        users
    )

    const usersFromBase = await many(getSelectAllUsersQuery())
    const result = {}

    usersFromBase.forEach(user => {
        if(users.find(u => u[cols.NAME] === user[cols.NAME])) {
            result[user.id] = user
        }
    })

    return result
}

export async function fillItems (N) {
    const items = generators.getItems(N)
    const table = TABLES.ITEMS
    const cols = table.COLUMNS
    const columns = [
        cols.NAME
    ]

    await insert(
        table.NAME,
        columns,
        items
    )

    const itemsFromBase = await many(getSelectAllItemsQuery())
    const result = {}

    itemsFromBase.forEach(item => {
        if(items.find(i => i[cols.NAME] === item[cols.NAME])) {
            result[item.id] = item
        }
    })

    return result
}

//many to many relation fillers
export async function fillUserItems(users, items, dataAmounts) {
    const table = TABLES.USER_ITEMS
    const cols = table.COLUMNS
    const userItems = generators.getUserItems(users, items, dataAmounts)
    const columns = [
        cols.USER_ID,
        cols.ITEM_ID
    ]

    await insert(
        table.NAME,
        columns,
        userItems
    )

    const userItemsFromBase = await many(getSelectAllUserItemsQuery())

    const result = {}
    userItemsFromBase.forEach(userItem => {
        if (userItems.find(ui => ui[cols.USER_ID] === userItem[cols.USER_ID]
                && ui[cols.ITEM_ID] === userItem[cols.ITEM_ID])) {
            result[userItem.id] = userItem
        }
    })

    return result
}
