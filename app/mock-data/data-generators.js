import { TABLES } from '../constants'

const defaultDataAmounts = {
    items: 5,
    users: 5
}

//optional parametrised data generators
export function getUsers(N = defaultDataAmounts.users, prefix = '') {
    const cols = TABLES.USERS.COLUMNS

    return new Array(N).fill(1).map((item, index) => ({
        [cols.NAME]: `${prefix}userName${index}`
    }))
}

export function getItems(N = defaultDataAmounts.items, prefix = '') {
    const cols = TABLES.ITEMS.COLUMNS

    return new Array(N).fill(1).map((item, index) => ({
        [cols.NAME]: `${prefix}itemName${index}`
    }))
}

//many to many data generators
function getCutLength(l1, l2) {
    const K = 5
    return Math.max(1, Math.floor(K * Math.sqrt(l1 * l2)))
}

function getManyToMany(map1, map2, keyname1, keyname2) {
    const keys1 = Object.keys(map1)
    const keys2 = Object.keys(map2)
    let index1 = 0
    let index2 = 0
    const length = getCutLength(keys1.length, keys2.length)

    return new Array(length).fill(1).map(() => {
        const result = {
            [keyname1]: keys1[index1],
            [keyname2]: keys2[index2]
        }

        index1++
        if(index1 === keys1.length) {
            index1 = 0
            index2++
        }

        return result
    })
}

export function getUserItems(users, items, dataAmounts) {
    const cols = TABLES.USER_ITEMS.COLUMNS
    const userItems = getManyToMany(users, items, cols.USER_ID, cols.ITEM_ID)

    dataAmounts.userItems = userItems.length

    return userItems
}
