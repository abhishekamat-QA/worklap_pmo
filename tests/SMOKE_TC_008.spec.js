import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/login.page.js';
import { ProfilePage } from '../pages/profile.page.js';
import { ProjectPage } from '../pages/project.page.js';

import invitedUsers from '../test-data/invitedUsers.json';


test('PM Admin can create and edit project', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const projectPage = new ProjectPage(page);


    // ==========================================
    // GET PM ADMIN USER
    // ==========================================

    const pmAdmin = invitedUsers.find(
        user => user.role === 'PM Admin'
    );

    if (!pmAdmin) {
        throw new Error(
            'PM Admin user not found in invitedUsers.json'
        );
    }


    // ==========================================
    // LOGIN
    // ==========================================

    await loginPage.goto();

    await loginPage.login(
        pmAdmin.email,
        pmAdmin.password
    );

    await expect(page).toHaveURL(
        /projects/
    );


    // ==========================================
    // VERIFY PM ADMIN PROFILE
    // ==========================================

    await profilePage.openProfileDropdown();

    await profilePage.openProfile();

    await profilePage.verifyProfilePage();

    await profilePage.verifyOrganizationRole(
        pmAdmin.role
    );


    // ==========================================
    // OPEN PROJECTS
    // ==========================================

    await projectPage.openProjects();


    // ==========================================
    // GENERATE UNIQUE PROJECT NAME
    // ==========================================

    const projectName =
        `PM${Date.now().toString().slice(-10)}`;

    console.log(
        `Project Name: ${projectName}`
    );


    // ==========================================
    // CREATE PROJECT
    // ==========================================

    await projectPage.openCreateProject();

    await projectPage.createProject(
        projectName
    );


    // ==========================================
    // OPEN PROJECTS AGAIN
    // ==========================================

    await projectPage.openProjects();


    // ==========================================
    // VERIFY PROJECT CREATED
    // ==========================================

    await expect(
        page.getByText(
            projectName,
            {
                exact: true
            }
        )
    ).toBeVisible({
        timeout: 15000
    });

    console.log(
        `Project created successfully: ${projectName}`
    );


    // ==========================================
    // EXPECTED UPDATED PROJECT NAME
    // ==========================================

    const expectedUpdatedProjectName =
        projectName.slice(0, -2) + 'up';


    // ==========================================
    // EDIT PROJECT
    // ==========================================

    const editResult =
        await projectPage.editProject(
            projectName
        );


    // ==========================================
    // OPEN PROJECTS AFTER UPDATE
    // ==========================================

    await projectPage.openProjects();


    // ==========================================
    // VERIFY UPDATED PROJECT NAME
    // ==========================================

    await expect(
        page.getByText(
            editResult.updatedProjectName,
            {
                exact: true
            }
        )
    ).toBeVisible({
        timeout: 15000
    });


    // ==========================================
    // VERIFY OLD PROJECT NAME IS GONE
    // ==========================================

    await expect(
        page.getByText(
            projectName,
            {
                exact: true
            }
        )
    ).not.toBeVisible();


    // ==========================================
    // VERIFY PROJECT NAME UPDATE
    // ==========================================

    expect(
        editResult.updatedProjectName
    ).toBe(
        expectedUpdatedProjectName
    );


    // ==========================================
    // VERIFY UPDATED DESCRIPTION
    // ==========================================

    expect(
        editResult.updatedDescription
    ).toBeTruthy();

    expect(
        editResult.updatedDescription.length
    ).toBeLessThanOrEqual(200);


    // ==========================================
    // VERIFY UPDATED PROJECT TYPE
    // ==========================================

    expect(
        editResult.projectType
    ).toBeTruthy();


    // ==========================================
    // FINAL LOGS
    // ==========================================

    console.log(
        `Project updated successfully: ${editResult.updatedProjectName}`
    );

    console.log(
        `Description verified: ${editResult.updatedDescription.length} characters`
    );

    console.log(
        `Project Type verified: ${editResult.projectType}`
    );
});