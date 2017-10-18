import { TABLES, ROUTES } from '../../constants';
import { isValidUUID, isValidItemUpdate, getValidUpdate } from '../../helpers';
import { success, reject } from '../';
import * as ItemsService from '../../services/items';

export async function updateItem (req, res) {
    try {
        const itemId = req.params[ROUTES.ITEMS.ID];

        if(!isValidUUID(itemId)) {
            return reject(res, { itemId }, `Bad ${ROUTES.ITEMS.ID} passed`);
        }

        const item = await ItemsService.getItem(itemId);
        if(!item) {
            return reject(res, { itemId }, `Item with passed id does not exist.`);
        }

        const cols = TABLES.ITEMS.COLUMNS;
        const itemUpdate = getValidUpdate(req.body.item, [
            cols.NAME,
        ]);

        const itemUpdateValidationInfo = isValidItemUpdate(itemUpdate);
        if(itemUpdateValidationInfo) {
            return reject(res, { itemUpdateValidationInfo }, 'Invalid item data passed.');
        }

        const itemName = itemUpdate[TABLES.ITEMS.COLUMNS.NAME];
        const itemWithName = await ItemsService.getItemByName(itemName);
        if (itemWithName) {
            return reject(res, { [TABLES.ITEMS.COLUMNS.NAME]: itemUpdate[TABLES.ITEMS.COLUMNS.NAME] }, 'Name is already in use.');
        }

        const result = await ItemsService.updateItem(itemId, itemUpdate);

        return success(res, { result });
    } catch (error) {
        return reject(res, { error }, 'Update NOT OK');
    }
}
