import loginUsers from '../test-data/loginData.json';
import signupUsers from '../test-data/signupData.json';

export function getLoginUsers() {
  return loginUsers;
}

export function getFirstLoginUser() {
  return loginUsers[0];
}

export function getSignupUsers() {
  return signupUsers;
}

export function getFirstSignupUser() {
  return signupUsers[0];
}
