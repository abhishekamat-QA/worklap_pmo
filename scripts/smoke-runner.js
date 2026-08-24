const { execSync } = require('child_process');

const specs = [
  {
    name: 'Signup',
    file: 'tests/SU_TC_335.spec.js'
  },
  {
    name: 'Login',
    file: 'tests/SU_TC_338_login.spec.js'
  },
  {
    name: 'User Management',
    file: 'tests/manageuser.spec.js'
  }
];

console.log('\n==============================================');
console.log('           SMOKE TEST EXECUTION');
console.log('==============================================\n');

for (const spec of specs) {

  console.log('----------------------------------------------');
  console.log(`Starting: ${spec.name}`);
  console.log(`Spec: ${spec.file}`);
  console.log('----------------------------------------------\n');

  try {

    execSync(
      `npx playwright test "${spec.file}" --project=chromium --workers=1`,
      {
        stdio: 'inherit',
        shell: true
      }
    );

    console.log('\n----------------------------------------------');
    console.log(`✅ ${spec.name} PASSED`);
    console.log('----------------------------------------------\n');

  } catch (error) {

    console.error('\n----------------------------------------------');
    console.error(`❌ ${spec.name} FAILED`);
    console.error('----------------------------------------------\n');

    console.error(
      `Smoke test stopped because ${spec.name} failed.`
    );

    process.exit(1);
  }
}

console.log('\n==============================================');
console.log('       ✅ COMPLETE SMOKE TEST PASSED');
console.log('==============================================');

console.log(
  'Signup → Login → User Management'
);

console.log('==============================================\n');