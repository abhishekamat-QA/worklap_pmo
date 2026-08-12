import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
//import { validUser } from '../test-data/loginTestdata.js';
import loginUsers from '../test-data/runtimeUser.json';

test('Verify user can successfully login using valid credentials', async ({ page }) => 
{
  const loginPage = new LoginPage(page);

  await page.goto('https://wlqa.testingmonkey.com');

  await loginPage.login(loginUsers.email, loginUsers.password);

 await expect(page).toHaveURL(/dashboard/);

});