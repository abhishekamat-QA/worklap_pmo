import { expect } from '@playwright/test';

export class InvitedSignupPage {

    constructor(page) {

        this.page = page;

        this.firstNameInput =
            page.getByPlaceholder('First Name');

        this.lastNameInput =
            page.getByPlaceholder('Last Name');

        this.passwordInput =
            page.getByPlaceholder('Create Password');

        this.confirmPasswordInput =
            page.getByPlaceholder('Confirm Password');

        this.confirmButton =
            page.getByRole('button', {
                name: /^Confirm$/i
            });

        this.accountCreatedHeading =
            page.getByRole('heading', {
                name: /Account created successfully please login/i
            });

        this.successToast =
            page.getByRole('status').filter({
                hasText: 'Account created successfully'
            });

        this.invalidInviteMessage =
            page.getByRole('status').filter({
                hasText: 'Invalid invite link'
            });

        this.loginButton =
            page.getByRole('button', {
                name: /^Login$/i
            });
    }


    async open(signupUrl) {

        if (!signupUrl) {
            throw new Error(
                'Invited user signup URL is required.'
            );
        }

        console.log(
            `Opening signup URL: ${signupUrl}`
        );

        await this.page.goto(
            signupUrl,
            {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            }
        );

        console.log(
            `Current URL: ${this.page.url()}`
        );
    }


    async fillAccountDetails({
        firstName,
        lastName,
        password
    }) {

        await expect(
            this.firstNameInput
        ).toBeVisible({
            timeout: 30000
        });

        await this.firstNameInput.fill(
            firstName
        );

        await this.lastNameInput.fill(
            lastName
        );

        await this.passwordInput.fill(
            password
        );

        await this.confirmPasswordInput.fill(
            password
        );
    }


    async clickConfirm() {

        await expect(
            this.confirmButton
        ).toBeEnabled({
            timeout: 30000
        });

        await this.confirmButton.click();
    }
}