export function createRoute(base, route = '', params = {}) {
    if (!base) {
        throw new Error('createRoute base must be passed')
    }

    let result = route

    Object.keys(params).forEach(param => {
        result = result.replace(param, params[param])
    })

    return base + result
}
