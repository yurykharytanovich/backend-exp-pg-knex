import { TABLES, ROUTES } from '../../constants';
import { isValidUUID, isValidUserUpdate } from '../../helpers';
import { success, reject } from '../';
import { getValidUpdate } from '../../helpers';
import * as UsersService from '../../services/users';

export async function updateUser (req, res) {
    try {
        const userId = req.params[ROUTES.USERS.ID];

        if(!isValidUUID(userId)) {
            return reject(res, { userId }, `Bad ${ROUTES.USERS.ID} passed`);
        }

        const user = await UsersService.getUser(userId);
        if(!user) {
            return reject(res, { userId }, `User with passed id does not exist.`);
        }

        const cols = TABLES.USERS.COLUMNS;
        const userUpdate = getValidUpdate(req.body.user, [
            cols.NAME,
        ]);

        const userUpdateValidationInfo = isValidUserUpdate(userUpdate);

        if(userUpdateValidationInfo) {
            return reject(res, { userUpdateValidationInfo }, 'Invalid user data passed.');
        }

        const userName = userUpdate[TABLES.USERS.COLUMNS.NAME];
        const userWithName = await UsersService.getUserByName(userName);

        if (userWithName) {
            return reject(res, { [TABLES.USERS.COLUMNS.NAME]: userUpdate[TABLES.USERS.COLUMNS.NAME] }, 'Name is already in use.');
        }

        const result = await UsersService.updateUser(userId, userUpdate);

        return success(res, { result });
    } catch (error) {
        return reject(res, { error }, 'Update NOT OK');
    }
}
