import * as ItemsService from '../../services/items';
import { success, reject } from '../../api/index';
import { ROUTES } from '../../constants';
import { isValidUUID } from '../../helpers';

export async function getAllItems(req, res) {
    try {
        const items = await ItemsService.getAllItems();

        return success(res, { items });
    } catch (error) {
        return reject(res, { error });
    }
}

export async function getItemById(req, res) {
    try {
        const itemId = req.params[ROUTES.ITEMS.ID];

        if(!isValidUUID(itemId)) {
            return reject(res, { itemId }, `Bad ${ROUTES.ITEMS.ID} passed`);
        }

        const item = await ItemsService.getItem(itemId);
        if(!item) {
            return reject(res, { itemId }, 'Item with passed id does not exist.');
        }

        return success(res, { item });
    } catch (error) {
        return reject(res, { error });
    }
}
