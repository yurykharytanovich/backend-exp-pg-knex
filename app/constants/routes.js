const BASES = {
    ITEMS: '/items',
    USERS: '/users'
}

const IDS = {
    ITEMS: '/:itemId',
    USERS: '/:userId'
}

export const ROUTES = {
    ITEMS: {
        ID: IDS.ITEMS.slice(1),
        IDp: IDS.ITEMS.slice(2),
        BASE: BASES.ITEMS,
        GET_ALL: '',
        GET: IDS.ITEMS,
        ADD: '',
        UPDATE: IDS.ITEMS,
        DELETE: IDS.ITEMS
    },
    USERS: {
        ID: IDS.USERS.slice(1),
        IDp: IDS.USERS.slice(2),
        BASE: BASES.USERS,
        GET_ALL: '',
        GET: IDS.USERS,
        ADD: '',
        UPDATE: IDS.USERS,
        DELETE: IDS.USERS,
        GET_ITEMS: IDS.USERS + BASES.ITEMS,
        ADD_ITEMS: IDS.USERS + BASES.ITEMS,
        DELETE_ITEM: IDS.USERS + BASES.ITEMS + IDS.ITEMS,
        DELETE_ALL_ITEMS: IDS.USERS + BASES.ITEMS
    }
}
