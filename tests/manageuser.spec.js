import { test, expect } from '@playwright/test';
import { ManageUsersPage } from '../pages/manageuser.page.js';
import testData from '../test-data/manageUsersData.json' with { type: 'json' };

test.use({
    storageState: 'test-data/authState.json'
});

test.describe.configure({ mode: 'serial' });

test.describe('Manage Users Module', () => {

    const timestamp = Date.now();

    const orgAdminInvite = {
        ...testData.orgAdminInvite,
        email: `wlpmoautotest${timestamp}@getnada.com`
    };

    const pmAdminInvite = {
        ...testData.pmAdminInvite,
        email: orgAdminInvite.email,
        retryEmail: `wlpmoautotest${timestamp + 1}@getnada.com`
    };

    const pmManagerInvite = {
        ...testData.pmManagerInvite,
        email: `pmmanager${timestamp + 2}@getnada.com`
    };

    const pmUserInvite = {
    ...testData.pmUserInvite,
    email: `pmuser${timestamp + 3}@getnada.com`
    };

    test('SU_TC_340 - Invite Org Admin user', async ({ page }) => {

        const manageUsersPage = new ManageUsersPage(page);

        await page.goto('https://wlqa.testingmonkey.com');

        await manageUsersPage.navigateToManageUsers();

        await test.step(
            `${orgAdminInvite.testCaseId} - Invite ${orgAdminInvite.role} user`,
            async () => {

                test.info().annotations.push({
                    type: 'testCaseId',
                    description: orgAdminInvite.testCaseId
                });

                await manageUsersPage.openInviteUsers();

                await expect(
                    manageUsersPage.addNewUserHeading
                ).toBeVisible();

                await manageUsersPage.enterWorkEmail(
                    orgAdminInvite.email
                );

                await manageUsersPage.enableOrgAdminToggle();

                await expect(
                    manageUsersPage.addUserButton
                ).toBeEnabled();

                await manageUsersPage.clickAddUser();

                await expect(
                    manageUsersPage.successMessage
                ).toContainText(
                    /user invited successfully|invited successfully|invitation sent/i
                );
            }
        );
    });

    test('SU_TC_220 - Invite PM Admin user', async ({ page }) => {

        const manageUsersPage = new ManageUsersPage(page);

        await page.goto('https://wlqa.testingmonkey.com');

        await manageUsersPage.navigateToManageUsers();

        await test.step(
            `${pmAdminInvite.testCaseId} - Invite ${pmAdminInvite.role} user`,
            async () => {

                test.info().annotations.push({
                    type: 'testCaseId',
                    description: pmAdminInvite.testCaseId
                });

                await manageUsersPage.openInviteUsers();

                await expect(
                    manageUsersPage.addNewUserHeading
                ).toBeVisible();

                await manageUsersPage.enterWorkEmail(
                    pmAdminInvite.email
                );

                await manageUsersPage.selectProjectManagementAccess(
                    pmAdminInvite.projectManagementAccess
                );

                await expect(
                    manageUsersPage.addUserButton
                ).toBeEnabled();

                await manageUsersPage.clickAddUser();

                await manageUsersPage.expectEmailAlreadyExistsError();

                await manageUsersPage.resetForm();

                await manageUsersPage.enterWorkEmail(
                    pmAdminInvite.retryEmail
                );

                await manageUsersPage.selectProjectManagementAccess(
                    pmAdminInvite.projectManagementAccess
                );

                await expect(
                    manageUsersPage.addUserButton
                ).toBeEnabled();

                await manageUsersPage.clickAddUser();

                await expect(
                    manageUsersPage.successMessage
                ).toContainText(
                    /user invited successfully|invited successfully|invitation sent/i
                );
            }
        );
    });

    test('SU_TC_221 - Invite PM Manager user without project', async ({ page }) => {

        const manageUsersPage = new ManageUsersPage(page);

        await page.goto('https://wlqa.testingmonkey.com');

        await manageUsersPage.navigateToManageUsers();

        await test.step(
            `${pmManagerInvite.testCaseId} - Invite ${pmManagerInvite.role} without project`,
            async () => {

                test.info().annotations.push({
                    type: 'testCaseId',
                    description: pmManagerInvite.testCaseId
                });

                await manageUsersPage.openInviteUsers();

                await expect(
                    manageUsersPage.addNewUserHeading
                ).toBeVisible();

                await manageUsersPage.enterWorkEmail(
                    pmManagerInvite.email
                );

                await manageUsersPage.selectProjectManagementAccess(
                    pmManagerInvite.projectManagementAccess
                );

                await expect(
                    manageUsersPage.addUserButton
                ).toBeEnabled();

                await manageUsersPage.clickAddUser();

                await expect(
                    manageUsersPage.successMessage
                ).toContainText(
                    /user invited successfully|invited successfully|invitation sent/i
                );
            }
        );
    });
    test('SU_TC_222 - Invite PM User without project', async ({ page }) => {

    const manageUsersPage = new ManageUsersPage(page);

    await page.goto('https://wlqa.testingmonkey.com');

    await manageUsersPage.navigateToManageUsers();

    await test.step(
        `${pmUserInvite.testCaseId} - Invite ${pmUserInvite.role} without project`,
        async () => {

            test.info().annotations.push({
                type: 'testCaseId',
                description: pmUserInvite.testCaseId
            });

            await manageUsersPage.openInviteUsers();

            await expect(
                manageUsersPage.addNewUserHeading
            ).toBeVisible();

            await manageUsersPage.enterWorkEmail(
                pmUserInvite.email
            );

            await manageUsersPage.selectProjectManagementAccess(
                pmUserInvite.projectManagementAccess
            );

            await expect(
                manageUsersPage.addUserButton
            ).toBeEnabled();

            await manageUsersPage.clickAddUser();

            await expect(
                manageUsersPage.successMessage
            ).toContainText(
                /user invited successfully|invited successfully|invitation sent/i
            );
        }
    );
 });

});