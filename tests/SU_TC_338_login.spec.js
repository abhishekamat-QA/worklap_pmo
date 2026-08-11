import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { validUser } from '../test-data/loginTestdata.js';

test('Verify user can successfully login using valid credentials', async ({ page }) => 
{
  const loginPage = new LoginPage(page);

  await page.goto('https://wlqa.testingmonkey.com');

  await loginPage.login(validUser.email, validUser.password);

 await expect(page).toHaveURL(/dashboard/);

});