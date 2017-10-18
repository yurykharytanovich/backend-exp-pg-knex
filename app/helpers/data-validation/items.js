import { TABLES } from '../../constants';
import _ from 'lodash';

export function isValidItem(item) {
    const result = {};
    const cols = TABLES.ITEMS.COLUMNS;

    if(!_.isObject(item)) {
        return {
            error: 'Item is not an object',
        };
    }

    if(!_.isString(item[cols.NAME])) {
        result[cols.NAME] = `${cols.NAME} should be a string`;
    } else if (_.isEmpty(item[cols.NAME])) {
        result[cols.NAME] = `${cols.NAME} cannot be empty`;
    }

    return Object.keys(result).length > 0 ? result : null;
}

export function isValidItemUpdate(itemUpdate) {
    const result = {};
    const cols = TABLES.ITEMS.COLUMNS;

    if(!_.isObject(itemUpdate)) {
        return {
            error: 'Item is not an object',
        };
    }

    if(_.isEmpty(itemUpdate)) {
        return {
            error: 'Item update data is not passed',
        };
    }

    if(itemUpdate[cols.NAME] || itemUpdate[cols.NAME] === '') {
        if(!_.isString(itemUpdate[cols.NAME])) {
            result[cols.NAME] = `${cols.NAME} should be a string`;
        } else if (_.isEmpty(itemUpdate[cols.NAME])) {
            result[cols.NAME] = `${cols.NAME} cannot be empty`;
        }
    }

    return Object.keys(result).length > 0 ? result : null;
}
