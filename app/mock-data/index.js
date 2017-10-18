import * as checkers from './checkers';
import * as fillers from './fillers';
import * as removers from './removers';
export * from './data-generators';

export const dataAmounts = {
    //configurable
    users: 15,
    items: 6,
    //manyToManyRelationCalculated
    userItems: -1,
};

export async function fillDataBaseWithMockData() {
    const [
        items,
        users,
    ] = await Promise.all([
        fillers.fillItems(dataAmounts.items),
        fillers.fillUsers(dataAmounts.users),
    ]);

    const [
        userItems,
    ] = await Promise.all([
        fillers.fillUserItems(users, items, dataAmounts),
    ]);

    return {
        items,
        users,
        userItems,
    };
}

export async function removeMockDataFromDataBase(data) {
    global.data = undefined;

    await Promise.all([
        removers.removeUserItems(data.userItems),
    ]);
    await Promise.all([
        removers.removeItems(data.items),
        removers.removeUsers(data.users),
    ]);
}

export async function checkDataWasRemoved(data) {
    try {
        await Promise.all([
            checkers.checkUserItems(data.userItems),
            checkers.checkItems(data.items),
            checkers.checkUsers(data.users),
        ]);
        return true;
    } catch (error) {
        console.dir(error);
        return false;
    }
}
