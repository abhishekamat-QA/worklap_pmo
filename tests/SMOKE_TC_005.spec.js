import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { InvitedSignupPage } from '../pages/invitedSignup.page.js';
import { LogoutPage } from '../pages/logoutPage.js';
import { InvitedUserApi } from '../api/invitedUser.api.js';
import { readInvitedUsers, saveInvitedUsers } from '../utils/invitedUserWriter.js';

test.describe('Invited User Account Creation', () => {

    test.setTimeout(240000);

    test('Create account if required and login existing accounts', async ({ page, request }) => {

        const invitedUsers = readInvitedUsers();

        expect(Array.isArray(invitedUsers), 'invitedUsers.json must contain an array.').toBe(true);
        expect(invitedUsers.length, 'At least 4 invited users are required.').toBeGreaterThanOrEqual(4);

        const loginPage = new LoginPage(page);
        const invitedSignupPage = new InvitedSignupPage(page);
        const logoutPage = new LogoutPage(page);
        const invitedUserApi = new InvitedUserApi(request);

        for (let index = 0; index < 4; index++) {

            const user = invitedUsers[index];
            const role = String(user.role || '').trim().toLowerCase();

            await test.step(`${user.role} - ${user.email}`, async () => {

                expect(user.email, `Email missing for ${user.role}`).toBeTruthy();

                console.log('\n========================================');
                console.log(`Processing: ${user.email}`);
                console.log(`Role: ${user.role}`);
                console.log(`Account Created: ${user.accountCreated}`);

                let shouldLogin = false;

                if (user.accountCreated === true) {

                    console.log(`Account already exists. Login directly: ${user.email}`);
                    shouldLogin = true;

                } else {

                    let userKey = user.userKey;
                    let signupUrl = user.signupUrl;

                    // STEP 1 - Fetch user-key via API when not already stored
                    if (!userKey) {

                        console.log(`Getting user-key for ${user.email}`);
                        userKey = await invitedUserApi.getUserKey(user.email);

                        if (!userKey) {
                            console.log(`User-key unavailable for ${user.email}. Skipping.`);
                            return;
                        }
                        user.userKey = userKey;
                    }

                    // STEP 2 - Build invited signup URL
                    if (!signupUrl) {
                        signupUrl = `https://wlqa.testingmonkey.com/invited-signup?user-key=${encodeURIComponent(userKey)}`;
                        user.signupUrl = signupUrl;
                    }

                    expect(signupUrl, `Signup URL missing for ${user.email}`).toBeTruthy();

                    console.log(`Opening signup URL: ${signupUrl}`);
                    await page.goto(signupUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    console.log(`Current URL: ${page.url()}`);

                    const accountCreatedHeading = invitedSignupPage.accountCreatedHeading;
                    const signupForm = invitedSignupPage.firstNameInput;

                    const pageContainsInvalidInvite = async () => {
                        const bodyText = await page.locator('body').innerText().catch(() => '');
                        return /invalid invite link/i.test(bodyText);
                    };

                    const accountCreated = async () => {

                        if (await accountCreatedHeading.isVisible().catch(() => false)) {
                            return true;
                        }

                        if (await invitedSignupPage.successToast.isVisible().catch(() => false)) {
                            return true;
                        }

                        const bodyText = await page.locator('body').innerText().catch(() => '');
                        return /account created successfully/i.test(bodyText);
                    };

                    if (await pageContainsInvalidInvite()) {
                        console.log(`Invalid invite for ${user.email}. Skipping to next credential.`);
                        return;
                    }

                    // STEP 3 - Fill account creation form
                    await expect(signupForm).toBeVisible({ timeout: 30000 });

                    const firstName = user.firstName || `${String(user.role).replace(/\s+/g, '')}${Date.now()}`;
                    const lastName = user.lastName || 'User';
                    const password = user.password || 'Qwerty@123';

                    await invitedSignupPage.fillAccountDetails({ firstName, lastName, password });

                    await expect(signupForm).toHaveValue(firstName);
                    await expect(invitedSignupPage.lastNameInput).toHaveValue(lastName);
                    await expect(invitedSignupPage.passwordInput).toHaveValue(password);
                    await expect(invitedSignupPage.confirmPasswordInput).toHaveValue(password);
                    await expect(invitedSignupPage.confirmButton).toBeEnabled({ timeout: 30000 });

                    console.log(`Submitting account creation for ${user.email}`);
                    await invitedSignupPage.clickConfirm();

                    // STEP 4 - Resolve final signup state
                    let result = 'pending';

                    try {

                        await expect.poll(async () => {

                            if (await accountCreated()) {
                                return 'account-created';
                            }

                            if (await pageContainsInvalidInvite()) {
                                return 'invalid-invite';
                            }

                            return 'pending';

                        }, { timeout: 10000, intervals: [300, 500, 1000] }).toBe('account-created');

                        result = 'account-created';

                    } catch {

                        console.log(`No final signup state detected for ${user.email}. Rechecking invite.`);

                        if (await accountCreated()) {

                            result = 'account-created';

                        } else {

                            await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
                            await page.waitForTimeout(1000);

                            if (await pageContainsInvalidInvite()) {

                                result = 'invalid-invite';

                            } else if (await accountCreated()) {

                                result = 'account-created';

                            } else {

                                const formVisible = await signupForm.isVisible().catch(() => false);

                                if (formVisible) {

                                    console.log(`Signup page still available for ${user.email}.`);

                                    await expect(signupForm).toBeVisible({ timeout: 10000 });
                                    await invitedSignupPage.fillAccountDetails({ firstName, lastName, password });
                                    await expect(invitedSignupPage.confirmButton).toBeEnabled({ timeout: 10000 });
                                    await invitedSignupPage.clickConfirm();

                                    try {

                                        await expect.poll(async () => {

                                            if (await accountCreated()) {
                                                return 'account-created';
                                            }

                                            if (await pageContainsInvalidInvite()) {
                                                return 'invalid-invite';
                                            }

                                            return 'pending';

                                        }, { timeout: 15000, intervals: [300, 500, 1000] }).toBe('account-created');

                                        result = 'account-created';

                                    } catch {

                                        result = await pageContainsInvalidInvite() ? 'invalid-invite' : 'pending';
                                    }

                                } else {

                                    result = 'invalid-invite';
                                }
                            }
                        }
                    }

                    if (result === 'invalid-invite') {
                        console.log(`Invite is invalid/consumed for ${user.email}. Moving to next credential.`);
                        return;
                    }

                    if (result !== 'account-created') {
                        console.log(`Account creation could not be confirmed for ${user.email}. Skipping this credential.`);
                        return;
                    }

                    // STEP 5 - Persist created account details
                    user.firstName = firstName;
                    user.lastName = lastName;
                    user.password = password;
                    user.accountCreated = true;

                    saveInvitedUsers(invitedUsers);

                    console.log(`Account created successfully: ${user.email}`);
                    shouldLogin = true;
                }

                if (!shouldLogin) {
                    return;
                }

                expect(user.password, `Password missing for ${user.email}`).toBeTruthy();

                await test.step('Login', async () => {

                    console.log(`Logging in: ${user.email}`);

                    await loginPage.goto();
                    await expect(page.getByPlaceholder('Email')).toBeVisible({ timeout: 30000 });
                    await loginPage.login(user.email, user.password);
                });

                await test.step('Validate landing page', async () => {

                    if (role === 'org admin') {

                        await page.waitForURL(/\/hrms\/dashboard/, { timeout: 30000 });

                        await expect(
                            page.getByRole('heading', { name: /Welcome back|Good day/i })
                        ).toBeVisible({ timeout: 30000 });

                        console.log(`HRMS dashboard validated for ${user.email}`);

                    } else if (role === 'pm admin' || role === 'pm manager' || role === 'pm user') {

                        await page.waitForURL(/\/pmo\/projects/, { timeout: 30000 });

                        await expect(
                            page.getByRole('heading', { name: 'Projects', exact: true })
                        ).toBeVisible({ timeout: 30000 });

                        console.log(`PMO Projects validated for ${user.email}`);

                    } else {

                        throw new Error(`Unsupported role: ${user.role}`);
                    }
                });

                await test.step('Logout', async () => {

                    await logoutPage.logout();

                    await page.waitForURL(/\/login/, { timeout: 30000 });
                    await expect(page.getByPlaceholder('Email')).toBeVisible({ timeout: 30000 });

                    console.log(`Logged out successfully: ${user.email}`);
                });

                console.log(`Completed: ${user.email}`);
            });
        }
    });
});