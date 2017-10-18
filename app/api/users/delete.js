import { ROUTES } from '../../constants';
import { isValidUUID } from '../../helpers';
import { success, reject } from '../';
import * as UsersService from '../../services/users';
import { getItem } from '../../services';

export async function deleteUser (req, res) {
    try {
        const userId = req.params[ROUTES.USERS.ID];

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${ROUTES.USERS.ID} passed`);
        }

        let user = await UsersService.getUser(userId);
        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.');
        }

        await UsersService.deleteAllItemsOfUser(userId);

        user = await UsersService.deleteUser(userId);

        return success(res, { user });
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK');
    }
}

export async function deleteItemOfUser (req, res) {
    try {
        const userId =  req.params[ROUTES.USERS.ID];
        const itemId =  req.params[ROUTES.ITEMS.ID];

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${ROUTES.USERS.ID} passed`);
        }

        if(!isValidUUID(itemId)) {
            return reject(res, { itemId }, `Bad ${ROUTES.ITEMS.ID} passed`);
        }

        const user = await UsersService.getUser(userId);
        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.');
        }

        const item = await getItem(itemId);
        if(!item) {
            return reject(res, { itemId }, 'Item with passed id does not exist.');
        }

        const userItem = await UsersService.getItemOfUser(userId, itemId);
        if(!userItem) {
            return reject(res, {}, 'Passed item is not set to this user.');
        }

        const result = await UsersService.deleteItemOfUser(userId, itemId);

        return success(res, { result });
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK');
    }
}

export async function deleteAllItemsOfUser (req, res) {
    try {
        const userId =  req.params[ROUTES.USERS.ID];

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${ROUTES.USERS.ID} passed` );
        }

        const user = await UsersService.getUser(userId);

        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.');
        }

        const result = await UsersService.deleteAllItemsOfUser(userId);

        return success(res, { result });
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK');
    }
}
