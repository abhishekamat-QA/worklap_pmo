import loginUsers from '../test-data/loginData.json';

export function getLoginUsers() {
    return loginUsers;
}

export function getFirstUser() {
    return loginUsers[0];
}