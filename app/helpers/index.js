export * from './data-validation';
export * from './random';
export * from './route';
import _ from 'lodash';

export function isValidUUID(uuid) {
    return _.isString(uuid) && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function isValidUUIDsArray(uuids) {
    return _.isArray(uuids) && _.every(uuids, isValidUUID);
}

export function mapToArray(map) {
    return Object.keys(map).map(id => map[id]);
}

export function getValidUpdate(update = {}, fields) {
    return _.reduce(fields, (result, field) => {
        if(update.hasOwnProperty(field)) {
            result[field] = update[field];
        }

        return result;
    }, {});
}
