import fs from 'fs';
import path from 'path';

export function getRuntimeUser() {

  const filePath = path.resolve(
    './test-data/runtimeUser.json'
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      'runtimeUser.json does not exist. Please run the Signup test first.'
    );
  }

  const data = fs.readFileSync(
    filePath,
    'utf-8'
  );

  const user = JSON.parse(data);

  if (!user.email || !user.password) {
    throw new Error(
      'runtimeUser.json does not contain valid login credentials.'
    );
  }

  return user;
}