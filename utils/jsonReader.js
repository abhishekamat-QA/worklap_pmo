
import signupUsers from '../test-data/signupData.json';
import loginUsers from '../test-data/runtimeUser.json';

export function getLoginUsers() {
  return loginUsers;
}

export function getFirstLoginUser() {
  return loginUsers;
}

export function getSignupUsers() {
  return signupUsers;
}

export function getFirstSignupUser() {
  return signupUsers[0];
}