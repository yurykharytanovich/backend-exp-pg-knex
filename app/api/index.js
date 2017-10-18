import router from './router';

export function success(res, data) {
    const result = {
        success: true,
        message: 'Access OK',
        data,
    };

    res.status(200).send(result);
}

export function reject(res, data, message) {
    const result = {
        success: false,
        message: message || 'Access NOT OK',
        data,
    };

    res.status(400).send(result);
}

export default router;
