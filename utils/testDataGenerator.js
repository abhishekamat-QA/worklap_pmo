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