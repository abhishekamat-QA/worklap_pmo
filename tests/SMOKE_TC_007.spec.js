import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { ProjectPage } from '../pages/project.page.js';
import invitedUsers from '../test-data/invitedUsers.json' with { type: 'json' };
import { generateProjectName } from '../utils/testDataGenerator.js';

// Pick the Org Admin record from the invited users array
const orgAdmin = invitedUsers.find(user => user.role === 'Org Admin');

test.describe('PMO - Project Creation (Org Admin)', () => {

    test.setTimeout(120000);

    test('Verify Org Admin can successfully create a project', async ({ page }) => {

        expect(
            orgAdmin,
            'No "Org Admin" entry found in invitedUsers.json. Run SMOKE_TC_004 and SMOKE_TC_005 first.'
        ).toBeTruthy();

        expect(
            orgAdmin.accountCreated,
            `Account not created for ${orgAdmin?.email}. Run SMOKE_TC_005 first.`
        ).toBe(true);

        expect(
            orgAdmin.password,
            `Password missing for ${orgAdmin?.email} in invitedUsers.json.`
        ).toBeTruthy();

        const loginPage = new LoginPage(page);
        const projectPage = new ProjectPage(page);
        const projectName = generateProjectName();

        // STEP 1: Login as Org Admin
        
        await test.step('Login as Org Admin', async () => {

            await loginPage.goto();
            await loginPage.login(orgAdmin.email, orgAdmin.password);
            console.log(`Logged in as Org Admin: ${orgAdmin.email}`);

            // Org Admin lands on /hrms/dashboard (confirmed by SMOKE_TC_005)
            await page.waitForURL(/\/hrms\/dashboard/, { timeout: 30000 });
            await expect(page).toHaveURL(/\/hrms\/dashboard/);
        });

        // STEP 2: Navigate to PMO
        
        await test.step('Navigate to PMO Projects', async () => {

            await projectPage.navigateToProjects();
            await expect(projectPage.projectsHeading).toBeVisible({ timeout: 15000 });
        });

        // STEP 3: Create Project
        await test.step('Create new project', async () => {

            console.log(`Creating project: ${projectName}`);

            await projectPage.createProject({
                projectName,
                projectType: 'Software Development',
                ownerIndex: 0
            });

            console.log(`Project creation submitted: ${projectName}`);
        });

        // STEP 4: Validate Creation
        
        await test.step('Validate project creation', async () => {

            await expect(projectPage.successMessage).toBeVisible({ timeout: 15000 });
            console.log(`Project created successfully: ${projectName}`);
        });

        // STEP 5: Verify Project in List
        
        await test.step('Verify project appears in project list', async () => {

            await projectPage.navigateToProjects();
            await expect(projectPage.projectCard(projectName)).toBeVisible({ timeout: 15000 });
            console.log(`Project verified: ${projectName}`);
        });
    });
});