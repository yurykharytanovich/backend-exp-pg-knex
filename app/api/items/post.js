import { success, reject } from '../index';
import { isValidItem } from '../../helpers/data-validation';
import { formatItemForAdding } from '../../formatters/items';
import { TABLES } from '../../constants/tables';
import * as ItemsService from '../../services/items';

export async function addItem (req, res) {
    try {
        const itemValidationInfo = isValidItem(req.body.item);
        if(itemValidationInfo) {
            return reject(res, { itemValidationInfo }, 'Invalid item data passed.');
        }

        const itemName = req.body.item[TABLES.ITEMS.COLUMNS.NAME];
        const itemWithName = await ItemsService.getItemByName(itemName);
        if (itemWithName) {
            return reject(res, { [TABLES.ITEMS.COLUMNS.NAME]: req.body.item[TABLES.ITEMS.COLUMNS.NAME] }, 'Name is already in use.');
        }

        const data = formatItemForAdding(req.body.item);
        const item = await ItemsService.addItem(data);

        return success(res, { item });
    } catch (error) {
        return reject(res, { error }, 'Insert NOT OK');
    }
}
