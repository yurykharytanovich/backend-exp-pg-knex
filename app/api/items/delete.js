import { ROUTES } from '../../constants';
import { isValidUUID } from '../../helpers';
import { success, reject } from '../';
import * as ItemsService from '../../services/items';

export async function deleteItem (req, res) {
    try {
        const itemId = req.params[ROUTES.ITEMS.ID];

        if(!isValidUUID(itemId)) {
            return reject(res, { itemId }, `Bad ${ROUTES.ITEMS.ID} passed`);
        }

        let item = await ItemsService.getItem(itemId);
        if(!item) {
            return reject(res, { itemId }, 'Item with passed id does not exist.');
        }

        await ItemsService.deleteItemFromAllUsers(itemId);

        item = await ItemsService.deleteItem(itemId);

        return success(res, { item });
    } catch (error) {
        return reject(res, { error }, 'Delete NOT OK');
    }
}
