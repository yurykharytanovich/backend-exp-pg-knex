import { TABLES, ROUTES } from '../../constants';
import { success, reject } from '../index';
import { isValidUser, isValidUUID, isValidUUIDsArray } from '../../helpers';
import { formatUserForAdding } from '../../formatters';
import * as UsersService from '../../services/users';
import * as ItemsService from '../../services/items';

export async function addUser(req, res) {
    try {
        const userValidationInfo = isValidUser(req.body.user);
        if(userValidationInfo) {
            return reject(res, { userValidationInfo }, 'Invalid user data passed.');
        }

        const userName = req.body.user[TABLES.USERS.COLUMNS.NAME];
        const userWithName = await UsersService.getUserByName(userName);
        if (userWithName) {
            return reject(res, { [TABLES.USERS.COLUMNS.NAME]: req.body.user[TABLES.USERS.COLUMNS.NAME] }, 'Name is already in use.');
        }

        const data = formatUserForAdding(req.body.user);
        const user = await UsersService.addUser(data);

        return success(res, { user });
    } catch (error) {
        return reject(res, { error }, 'Insert NOT OK');
    }
}

export async function addItemsToUser(req, res) {
    try {
        const userId = req.params[ROUTES.USERS.ID];

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${ROUTES.USERS.ID} passed`);
        }

        if(!isValidUUIDsArray(req.body.itemsIds)) {
            return reject(res, {}, 'Invalid items ids.');
        }

        const user = await UsersService.getUser(userId);
        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.');
        }

        if(req.body.itemsIds.length === 0) {
            return success(res, { userItems: [] });
        }

        const itemsIdsFromBase = await ItemsService.getItemsByIds(req.body.itemsIds);
        if(itemsIdsFromBase.length !== req.body.itemsIds.length) {
            const map = {};
            itemsIdsFromBase.forEach(id => map[id.id] = true);
            const absentIds = req.body.itemsIds.filter(id => !map[id]);

            return reject(res, { absentIds }, 'Some of items ids are not presented in db.');
        }

        const itemsOfUserFromBase = await UsersService.getItemsOfUserByIds(userId, req.body.itemsIds);

        if(itemsOfUserFromBase.length > 0) {
            const itemsMap = {};
            itemsOfUserFromBase.forEach(item =>
                itemsMap[item.id] = true
            );
            const addedItemsIds = req.body.itemsIds.filter(id => itemsMap[id]);

            return reject(res, { addedItemsIds }, 'Some of items ids are already added to user.');
        }

        const result = await UsersService.addItemsToUser(userId, req.body.itemsIds);

        return success(res, { userItems: result });
    } catch (error) {
        return reject(res, { error }, 'Insert NOT OK');
    }
}
