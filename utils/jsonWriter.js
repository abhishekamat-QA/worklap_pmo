import fs from 'fs';
import path from 'path';

export function saveRuntimeUser(userData) {

  const filePath = path.resolve(
    './test-data/runtimeUser.json'
  );

  fs.writeFileSync(
    filePath,
    JSON.stringify(userData, null, 2)
  );

  console.log(`Runtime user saved to: ${filePath}`);
}