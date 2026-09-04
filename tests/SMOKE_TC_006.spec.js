import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { ProjectPage } from '../pages/project.page.js';
import runtimeUser from '../test-data/runtimeUser.json' with { type: 'json' };
import { generateProjectName } from '../utils/testDataGenerator.js';

test.describe('PMO - Project Creation', () => {

    test.setTimeout(120000);

    test('Verify Org Owner can successfully create a project', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const projectPage = new ProjectPage(page);
        const projectName = generateProjectName();

        // =====================================================
        // STEP 1: Login
        // =====================================================

        await test.step('Login as Org Owner', async () => {

            await loginPage.goto();
            await loginPage.login(runtimeUser.email, runtimeUser.password);
            console.log(`Logged in as Org Owner: ${runtimeUser.email}`);

            await page.waitForURL(/dashboard/, { timeout: 30000 });
            await expect(page).toHaveURL(/dashboard/);
        });

        // =====================================================
        // STEP 2: Navigate to PMO
        // =====================================================

        await test.step('Navigate to PMO Projects', async () => {

            await projectPage.navigateToProjects();
            await expect(projectPage.projectsHeading).toBeVisible({ timeout: 15000 });
            console.log('Projects page loaded successfully');
        });

        // =====================================================
        // STEP 3: Create Project
        // =====================================================

        await test.step('Create new project', async () => {

            console.log(`Creating project: ${projectName}`);
            await projectPage.createProject({projectName,projectType: 'Software Development',ownerIndex: 0});
            console.log(`Project creation submitted: ${projectName}`);
        });

        // =====================================================
        // STEP 4: Validate Creation
        // =====================================================

        await test.step('Validate project creation', async () => {
            await expect(projectPage.successMessage).toBeVisible({ timeout: 15000 });
            console.log(`Project created successfully: ${projectName}`);
        });

        // =====================================================
        // STEP 5: Verify Project in List
        // =====================================================

        await test.step('Verify project appears in project list', async () => {
            await projectPage.navigateToProjects();
            await expect(projectPage.projectCard(projectName)).toBeVisible({ timeout: 15000 });
            console.log(`Project verified: ${projectName}`);
        });
    });
});