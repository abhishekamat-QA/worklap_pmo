import { test, expect } from '@playwright/test';

import { LoginPage }
    from '../pages/login.page.js';

import { ManageUsersPage }
    from '../pages/manageuser.page.js';

import runtimeUser
    from '../test-data/runtimeUser.json'
    with { type: 'json' };

import {
    generateInviteEmails
} from '../utils/testDataGenerator.js';

import {
    saveInvitedUsers
} from '../utils/invitedUserWriter.js';


test.describe(
    'Manage Users Module',
    () => {

        test.setTimeout(120000);

        test(
            'Manage Users - Invite users with different access levels',
            async ({ page }) => {

                const loginPage =
                    new LoginPage(page);

                const manageUsersPage =
                    new ManageUsersPage(page);

                const emails =
                    generateInviteEmails();

                await test.step(
                    'Login using runtime user',
                    async () => {

                        await loginPage.goto();

                        await loginPage.login(
                            runtimeUser.email,
                            runtimeUser.password
                        );
                    }
                );

                await test.step(
                    'Navigate to Manage Users',
                    async () => {

                        await manageUsersPage
                            .navigateToManageUsers();

                        await expect(
                            manageUsersPage.manageUsersHeading
                        ).toBeVisible({
                            timeout: 15000
                        });
                    }
                );

                await test.step(
                    'SU_TC_340 - Invite Org Admin',
                    async () => {

                        await manageUsersPage.inviteUser({
                            email:
                                emails.orgAdminEmail,

                            orgAdmin:
                                true
                        });

                        await expect(
                            manageUsersPage.successMessage
                        ).toBeVisible({
                            timeout: 15000
                        });
                    }
                );

                await test.step(
                    'SU_TC_220 - Invite PM Admin',
                    async () => {

                        await manageUsersPage.inviteUser({
                            email:
                                emails.pmAdminRetryEmail,

                            projectManagementAccess:
                                'Admin'
                        });

                        await expect(
                            manageUsersPage.successMessage
                        ).toBeVisible({
                            timeout: 15000
                        });
                    }
                );

                await test.step(
                    'SU_TC_221 - Invite PM Manager',
                    async () => {

                        await manageUsersPage.inviteUser({
                            email:
                                emails.pmManagerEmail,

                            projectManagementAccess:
                                'Manager'
                        });

                        await expect(
                            manageUsersPage.successMessage
                        ).toBeVisible({
                            timeout: 15000
                        });
                    }
                );

                await test.step(
                    'SU_TC_222 - Invite PM User',
                    async () => {

                        await manageUsersPage.inviteUser({
                            email:
                                emails.pmUserEmail,

                            projectManagementAccess:
                                'User'
                        });

                        await expect(
                            manageUsersPage.successMessage
                        ).toBeVisible({
                            timeout: 15000
                        });
                    }
                );

                await test.step(
                    'Validate duplicate email error',
                    async () => {

                        await manageUsersPage
                            .submitDuplicateEmail({
                                existingEmail:
                                    emails.orgAdminEmail,

                                projectManagementAccess:
                                    'User'
                            });

                        await expect(
                            manageUsersPage.emailExistsMessage
                        ).toBeVisible({
                            timeout: 10000
                        });
                    }
                );

                const retryEmails =
                    generateInviteEmails();

                const retryEmail =
                    retryEmails.orgAdminEmail;

                await test.step(
                    'Retry invitation with new email',
                    async () => {

                        await manageUsersPage
                            .retryWithNewEmail({
                                email:
                                    retryEmail,

                                projectManagementAccess:
                                    'User'
                            });

                        await expect(
                            manageUsersPage.successMessage
                        ).toBeVisible({
                            timeout: 15000
                        });
                    }
                );

                const invitedUsers = [

                    {
                        role: 'Org Admin',
                        email:
                            emails.orgAdminEmail,
                        accountCreated: false
                    },

                    {
                        role: 'PM Admin',
                        email:
                            emails.pmAdminRetryEmail,
                        accountCreated: false
                    },

                    {
                        role: 'PM Manager',
                        email:
                            emails.pmManagerEmail,
                        accountCreated: false
                    },

                    {
                        role: 'PM User',
                        email:
                            emails.pmUserEmail,
                        accountCreated: false
                    }

                ];

                await test.step(
                    'Save invited users',
                    async () => {

                        saveInvitedUsers(
                            invitedUsers
                        );
                    }
                );

                expect(
                    invitedUsers
                ).toHaveLength(4);

                expect(
                    invitedUsers.every(
                        user =>
                            user.email &&
                            user.accountCreated === false
                    )
                ).toBeTruthy();
            }
        );
    }
);