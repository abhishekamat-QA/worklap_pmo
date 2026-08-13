import { expect } from '@playwright/test';

export class ManageUsersPage {

    constructor(page) {
        this.page = page;

        this.manageUsersHeading = page.getByRole('heading', {
            name: 'Manage Users'
        });

        this.inviteUsersButton = page.getByRole('button', {
            name: /Invite Users/i
        });

        this.addUserDialog = page.getByRole('dialog', {
            name: 'Add New User'
        });

        this.addNewUserHeading = this.addUserDialog.getByRole(
            'heading',
            {
                name: 'Add New User'
            }
        );

        this.workEmailInput = this.addUserDialog.getByRole(
            'textbox',
            {
                name: 'Work Email'
            }
        );

        this.addUserButton = this.addUserDialog.getByRole(
            'button',
            {
                name: /^Add User$/i
            }
        );

        this.resetButton = this.addUserDialog.getByRole(
            'button',
            {
                name: /^Reset$/i
            }
        );

        this.orgAdminLabel = this.addUserDialog.getByText(
            'Invite as Org Admin',
            {
                exact: true
            }
        );

        this.orgAdminToggle = this.orgAdminLabel.locator(
            'xpath=following::button[1]'
        );

        this.hrmsAccessDropdown =
            this.getAccessDropdown('HRMS Access');

        this.projectManagementAccessDropdown =
            this.getAccessDropdown(
                'Project Management Access'
            );

        this.crmAccessDropdown =
            this.getAccessDropdown('CRM Access');

        this.projectSearchInput =
            this.addUserDialog.getByPlaceholder(
                'Search and assign projects'
            );


        this.emailExistsMessage =
            this.page.getByText(
                'Email already exists',
                {
                    exact: true
                }
            );

        this.moduleAccessError =
            this.addUserDialog.getByText(
                'Please select at least one module access level.',
                {
                    exact: true
                }
            );

        this.successMessage =
            this.page.getByText(
                /user invited successfully|invited successfully|invitation sent/i
            );
    }

    getAccessDropdown(accessName) {

        return this.addUserDialog
            .getByText(
                accessName,
                {
                    exact: true
                }
            )
            .locator('..')
            .getByRole('button')
            .first();
    }

    async navigateToManageUsers() {

        const profileButton =
            this.page.getByRole(
                'button',
                {
                    name: /Org Owner|PM Admin|Org Admin/i
                }
            ).first();

        await expect(
            profileButton
        ).toBeVisible({
            timeout: 15000
        });

        await profileButton.click();

        const manageUsersMenu =
            this.page.getByText(
                'Manage Users',
                {
                    exact: true
                }
            );

        await expect(
            manageUsersMenu
        ).toBeVisible({
            timeout: 10000
        });

        await manageUsersMenu.click();

        await expect(
            this.manageUsersHeading
        ).toBeVisible({
            timeout: 15000
        });
    }

    async openInviteUser() {

        await expect(
            this.inviteUsersButton
        ).toBeVisible({
            timeout: 10000
        });

        await this.inviteUsersButton.click();

        await expect(
            this.addNewUserHeading
        ).toBeVisible({
            timeout: 10000
        });
    }

    async enterEmail(email) {

        if (!email) {
            throw new Error(
                'Invite email was not generated.'
            );
        }

        await this.workEmailInput.fill(email);

        await expect(
            this.workEmailInput
        ).toHaveValue(email);
    }

    async enableOrgAdmin() {

        await expect(
            this.orgAdminLabel
        ).toBeVisible({
            timeout: 10000
        });

        await expect(
            this.orgAdminToggle
        ).toBeVisible({
            timeout: 10000
        });

        await this.orgAdminToggle.click();

        await expect(
            this.addUserButton
        ).toBeEnabled({
            timeout: 10000
        });
    }

    async selectAccess(
        dropdown,
        accessLevel
    ) {

        if (!accessLevel) {
            throw new Error(
                'Access level was not provided.'
            );
        }

        await dropdown.click();

        const option =
            this.page.getByText(
                accessLevel,
                {
                    exact: true
                }
            ).last();

        await expect(
            option
        ).toBeVisible({
            timeout: 5000
        });

        await option.click();
    }


    async selectProjectManagementAccess(
        accessLevel
    ) {

        await this.selectAccess(
            this.projectManagementAccessDropdown,
            accessLevel
        );
    }


    async selectHRMSAccess(
        accessLevel
    ) {

        await this.selectAccess(
            this.hrmsAccessDropdown,
            accessLevel
        );
    }


    async selectCRMAccess(
        accessLevel
    ) {

        await this.selectAccess(
            this.crmAccessDropdown,
            accessLevel
        );
    }

    async assignProject(projectName) {

        if (!projectName) {
            throw new Error(
                'Project name was not provided.'
            );
        }

        await this.projectSearchInput.click();

        const project =
            this.addUserDialog.getByText(
                projectName,
                {
                    exact: true
                }
            );

        await expect(
            project
        ).toBeVisible({
            timeout: 5000
        });

        await project.click();
    }

    async submitUser() {

        await expect(
            this.addUserButton
        ).toBeEnabled({
            timeout: 10000
        });

        await this.addUserButton.click();
    }

    async verifyInvitationSuccess() {

        await expect(
            this.successMessage
        ).toBeVisible({
            timeout: 10000
        });
    }

    async verifyEmailAlreadyExists() {

        await expect(
            this.emailExistsMessage
        ).toBeVisible({
            timeout: 10000
        });
    }

    async resetUserForm() {

        await this.resetButton.click();

        await expect(
            this.workEmailInput
        ).toHaveValue('');
    }

    async inviteUser({
        email,
        orgAdmin = false,
        projectManagementAccess = null,
        hrmsAccess = null,
        crmAccess = null,
        project = null
    }) {

        await this.openInviteUser();

        await this.enterEmail(email);

        if (orgAdmin) {

            await this.enableOrgAdmin();

        } else {

            if (hrmsAccess) {

                await this.selectHRMSAccess(
                    hrmsAccess
                );
            }

            if (projectManagementAccess) {

                await this.selectProjectManagementAccess(
                    projectManagementAccess
                );
            }

            if (crmAccess) {

                await this.selectCRMAccess(
                    crmAccess
                );
            }

            if (project) {

                await this.assignProject(
                    project
                );
            }

            await expect(
                this.addUserButton
            ).toBeEnabled({
                timeout: 10000
            });
        }

        await this.submitUser();

        await this.verifyInvitationSuccess();
    }

    async inviteDuplicateEmailAndRetry({
        existingEmail,
        retryEmail,
        projectManagementAccess
    }) {

        await this.openInviteUser();

        await this.enterEmail(
            existingEmail
        );

        await this.selectProjectManagementAccess(
            projectManagementAccess
        );

        await this.submitUser();

        await this.verifyEmailAlreadyExists();

        await this.resetUserForm();

        await this.enterEmail(
            retryEmail
        );

        await this.selectProjectManagementAccess(
            projectManagementAccess
        );

        await this.submitUser();

        await this.verifyInvitationSuccess();
    }
}