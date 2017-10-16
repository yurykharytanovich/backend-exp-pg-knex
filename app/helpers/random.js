import uuidv4 from 'uuid/v4'

export function getNotExistingUUID(UUIDs) {
    let uuid = uuidv4()
    let limitCounter = 0
    const limit = 10 * UUIDs.length
    const UUIDsMap = UUIDs.reduce((acc, id) => { acc[id] = id; return acc }, {})

    while(UUIDsMap[uuid]) {
        uuid = uuidv4()
        if(limitCounter++ > limit) {
            throw new Error('Attempts to get unpresented uuid limit reached.')
        }
    }

    return uuid
}
