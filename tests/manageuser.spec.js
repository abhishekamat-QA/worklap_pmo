import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { ManageUsersPage } from '../pages/manageuser.page.js';
import runtimeUser from '../test-data/runtimeUser.json' with { type: 'json' };
import { generateInviteEmails } from '../utils/testDataGenerator.js';

test.describe(
    'Manage Users Module',
    () => {

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
                    }
                );

                await test.step(
                    'SU_TC_220 - Invite PM Admin with duplicate email validation',
                    async () => {

                        await manageUsersPage
                            .inviteDuplicateEmailAndRetry({

                             
                                existingEmail:
                                    emails.orgAdminEmail,

                                
                                retryEmail:
                                    emails.pmAdminRetryEmail,

                                projectManagementAccess:
                                    'Admin'
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
                    }
                );
            }
        );
    }
);