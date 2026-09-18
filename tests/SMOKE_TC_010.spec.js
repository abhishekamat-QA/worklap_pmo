import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { LogoutPage } from '../pages/logoutPage.js';
import { readInvitedUsers } from '../utils/invitedUserWriter.js';

test.describe('PM User Project Access', () => {
  test.setTimeout(120000);

  test('PM User can view assigned projects, open first project and logout', async ({
    page
  }) => {
    const invitedUsers = readInvitedUsers();

    const pmUser = invitedUsers.find(
      (user) =>
        user.role?.toLowerCase() === 'pm user' &&
        user.accountCreated === true
    );

    expect(
      pmUser,
      'Created PM User credentials were not found in invitedUsers.json.'
    ).toBeTruthy();

    expect(pmUser.email).toBeTruthy();
    expect(pmUser.password).toBeTruthy();

    const loginPage = new LoginPage(page);
    const logoutPage = new LogoutPage(page);

    await loginPage.goto();

    await loginPage.login(
      pmUser.email,
      pmUser.password
    );

    console.log(`PM User logged in successfully: ${pmUser.email}`);

    await expect(
      page.getByRole('heading', { name: 'Projects', exact: true })
    ).toBeVisible({
      timeout: 30000
    });

    console.log('Projects page is displayed.');

    const projectLinks = page.locator(
      'a[href*="/pmo/"]'
    );

    const projectCount = await projectLinks.count();

    expect(
      projectCount,
      'No projects are visible for the PM User.'
    ).toBeGreaterThan(0);

    console.log(`Projects visible to PM User: ${projectCount}`);

    const firstProject = projectLinks.first();

    await expect(firstProject).toBeVisible({
      timeout: 30000
    });

    const firstProjectName = (
      await firstProject.innerText()
    ).trim();

    console.log(`Opening first project: ${firstProjectName}`);

    await firstProject.click();

    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).toMatch(/\/pmo\//);

    console.log(`Project opened successfully: ${page.url()}`);

    await logoutPage.logout();

    console.log('PM User logout completed successfully.');
  });
});