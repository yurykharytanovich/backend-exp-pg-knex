import { TABLES } from '../../constants';
import _ from 'lodash';

export function isValidUser(user) {
    const result = {};
    const cols = TABLES.USERS.COLUMNS;

    if(!_.isObject(user)) {
        return {
            error: 'User is not an object',
        };
    }

    if(!_.isString(user[cols.NAME])) {
        result[cols.NAME] = `${cols.NAME} should be a string`;
    } else if (_.isEmpty(user[cols.NAME])) {
        result[cols.NAME] = `${cols.NAME} cannot be empty`;
    }

    return Object.keys(result).length > 0 ? result : null;
}

export function isValidUserUpdate(userUpdate) {
    const result = {};
    const cols = TABLES.USERS.COLUMNS;

    if(!_.isObject(userUpdate)) {
        return {
            error: 'User is not an object',
        };
    }

    if(_.isEmpty(userUpdate)) {
        return {
            error: 'User update data is not passed',
        };
    }

    if(userUpdate[cols.NAME] || userUpdate[cols.NAME] === '') {
        if(!_.isString(userUpdate[cols.NAME])) {
            result[cols.NAME] = `${cols.NAME} should be a string`;
        } else if (_.isEmpty(userUpdate[cols.NAME])) {
            result[cols.NAME] = `${cols.NAME} cannot be empty`;
        }
    }

    return Object.keys(result).length > 0 ? result : null;
}
