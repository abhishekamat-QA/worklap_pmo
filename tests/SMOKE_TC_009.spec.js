import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/login.page.js';
import { ProfilePage } from '../pages/profile.page.js';
import { ProjectPage } from '../pages/project.page.js';

import invitedUsers from '../test-data/invitedUsers.json';


test(
    'PM Manager can update the latest project',
    async ({ page }) => {

        const loginPage = new LoginPage(page);
        const profilePage = new ProfilePage(page);
        const projectPage = new ProjectPage(page);


        // ==========================================
        // GET PM MANAGER USER
        // ==========================================

        const pmManager = invitedUsers.find(user => user.role === 'PM Manager');

        if (!pmManager) {throw new Error('PM Manager user not found in invitedUsers.json');}


        // ==========================================
        // LOGIN AS PM MANAGER
        // ==========================================

        await loginPage.goto();
        await loginPage.login(pmManager.email,pmManager.password);

        // ==========================================
        // VERIFY DASHBOARD
        // ==========================================

        await expect(page).toHaveURL(/projects/,{timeout: 15000});

        // ==========================================
        // OPEN PROFILE
        // ==========================================

        await profilePage.openProfileDropdown();
        await profilePage.openProfile();

        // ==========================================
        // VERIFY PROFILE
        // ==========================================

        await profilePage.verifyProfilePage();
        await profilePage.verifyOrganizationRole(pmManager.role);

        // ==========================================
        // OPEN VIEW ALL PROJECTS
        // ==========================================

        await projectPage.openProjects();

        // ==========================================
        // GET TOP / LATEST PROJECT
        // ==========================================

        const currentProjectName =await projectPage.getTopProjectName();
        console.log(`Latest Project: ${currentProjectName}`);

        // ==========================================
        // GENERATE EXPECTED UPDATED PROJECT NAME
        // Remove last 3 characters
        // Add "mng"
        // ==========================================

        const expectedUpdatedProjectName =currentProjectName.slice(0, -3) + 'mng';
        console.log(`Expected Updated Project: ${expectedUpdatedProjectName}`);

        // ==========================================
        // EDIT LATEST PROJECT AS PM MANAGER
        // ==========================================

        const editResult =await projectPage.editProjectAsManager(currentProjectName);

      // ==========================================
// NAVIGATE TO VIEW ALL PROJECTS AGAIN
// ==========================================

await projectPage.openProjects();

// ==========================================
// VERIFY UPDATED PROJECT IS DISPLAYED
// ==========================================

const updatedProject =page.locator('table tbody tr div.font-semibold.text-neutral').filter({hasText: expectedUpdatedProjectName});
await expect(updatedProject).toBeVisible({timeout: 15000});

// ==========================================
// VERIFY UPDATED PROJECT NAME
// ==========================================

expect(editResult.updatedProjectName).toBe(expectedUpdatedProjectName);

        // ==========================================
        // FINAL LOG
        // ==========================================

        console.log(
            `Project successfully updated: ` +
            `${currentProjectName} → ` +
            `${expectedUpdatedProjectName}`
        );
    }
);