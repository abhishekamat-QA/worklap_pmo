export function generateUniqueSignupUser(baseUser) {

  const timestamp = Date.now();

  return {
    ...baseUser,

    email: `wlpmoautotest${timestamp}@getnada.com`,

    password: baseUser.password || 'Qwerty@123'
  };
}


export function generateFallbackUser(baseUser) {

  const timestamp = Date.now();

  return {
    ...baseUser,

    email: `wlpmoautotest${timestamp}_fallback@getnada.com`,

    password: baseUser.password || 'Qwerty@123'
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