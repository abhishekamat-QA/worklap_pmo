export function generateFallbackUser() {
    const timestamp = Date.now();

    return {
        firstName: `Demo${timestamp}`,
        lastName: `User${timestamp}`,
        email: `wlpmoautotest${timestamp}@getnada.com`,
        password: 'Qwerty@123',
        companyName: 'Sample Company Pvt Ltd'
    };
}

export function generateInviteEmails() {

    const timestamp = Date.now();

    return {
        orgAdminEmail:
            `wlpmoautotest${timestamp}@getnada.com`,

        pmAdminRetryEmail:
            `wlpmoautotest${timestamp + 1}@getnada.com`,

        pmManagerEmail:
            `pmmanager${timestamp + 2}@getnada.com`,

        pmUserEmail:
            `pmuser${timestamp + 3}@getnada.com`
    };
}