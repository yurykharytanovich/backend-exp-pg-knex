import { success, reject } from '../index';
import { ROUTES } from '../../constants';
import { isValidUUID } from '../../helpers';
import * as UsersService from '../../services/users';

export async function getAllUsers(req, res) {
    try {
        const users = await UsersService.getAllUsers();

        return success(res, { users });
    } catch (error) {
        return reject(res, { error });
    }
}

export async function getUserById(req, res) {
    try {
        const userId = req.params[ROUTES.USERS.ID];

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${ROUTES.USERS.ID} passed`);
        }

        const user = await UsersService.getUser(userId);
        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.');
        }

        return success(res, { user });
    } catch (error) {
        return reject(res, { error });
    }
}

export async function getAllItemsOfUser(req, res) {
    try {
        const userId =  req.params[ROUTES.USERS.ID];

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${ROUTES.USERS.ID} passed`);
        }

        const user = await UsersService.getUser(userId);
        if(!user) {
            return reject(res, { userId }, 'User with passed id does not exist.');
        }

        const items = await UsersService.getAllItemsOfUser(userId);

        return success(res, { items });
    } catch (error) {
        return reject(res, { error });
    }
}
