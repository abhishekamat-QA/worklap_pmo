import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { LogoutPage } from '../pages/LogoutPage.js';
import { validUser } from '../test-data/loginTestdata.js';

test('Verify user can successfully logout', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const logoutPage = new LogoutPage(page);

  await page.goto('https://wlqa.testingmonkey.com');

  await loginPage.login(validUser.email, validUser.password);

  await expect(page).toHaveURL(/dashboard/);
  

  await logoutPage.logout();

 await expect(page).toHaveURL(/login/);

});