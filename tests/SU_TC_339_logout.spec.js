import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { LogoutPage } from '../pages/logoutPage.js';
import loginUsers from '../test-data/runtimeUser.json';

test('Verify user can successfully logout', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const logoutPage = new LogoutPage(page);

  await page.goto('https://wlqa.testingmonkey.com');

  await loginPage.login(loginUsers.email, loginUsers.password);

  await expect(page).toHaveURL(/dashboard/);
  

  await logoutPage.logout();

 await expect(page).toHaveURL(/login/);

});