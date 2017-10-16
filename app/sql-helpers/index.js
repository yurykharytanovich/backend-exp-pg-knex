export * from './items'
export * from './users'
export * from './user_items'

import squel from 'squel'

const squelPostgres = squel.useFlavour('postgres')

export function getSelectInstancesQuery(table) {
    return squel.select()
        .from(table)
        .toString()
}

export function getSelectInstanceByIdQuery(table, id) {
    return squel.select()
        .from(table)
        .where(`id = '${id}'`)
        .toString()
}

export function getSelectInstancesByIdsQuery(table, ids) {
    return squel.select()
        .from(table)
        .where(`id in (${ids.map(id => `'${id}'`)})`)
        .toString()
}

export function getInsertInstancesQuery(table, values) {
    return squelPostgres.insert()
        .into(table)
        .setFieldsRows(values)
        .returning('*')
        .toString()
}

export function getUpdateInstanceByIdQuery(table, id, values) {
    return squelPostgres.update()
        .table(table)
        .setFields(values)
        .where(`id = '${id}'`)
        .returning('*')
        .toString()
}

export function getDeleteInstancesByIdsQuery(table, ids) {
    return squelPostgres.delete()
        .from(table)
        .where(`id in (${ids.map(id => `'${id}'`)})`)
        .returning('*')
        .toString()
}
