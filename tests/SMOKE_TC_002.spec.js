import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import loginUsers from '../test-data/runtimeUser.json';

test('Verify user can successfully login using valid credentials', async ({ page }) => 
{
  const loginPage = new LoginPage(page);

  await page.goto('https://wlqa.testingmonkey.com');

  await loginPage.login(loginUsers.email, loginUsers.password);

 await expect(page).toHaveURL(/dashboard/);
  console.log(`✅ Login successful for: ${loginUsers.email}`);
  console.log(`🔑 Password used: ${loginUsers.password}`);

});