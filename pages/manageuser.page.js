export class ManageUsersPage {

    constructor(page) {
        this.page = page;

        this.manageUsersHeading =
            page.getByRole('heading', {
                name: 'Manage Users'
            });

        this.inviteUsersButton =
            page.getByRole('button', {
                name: /Invite Users/i
            });

        this.addUserDialog =
            page.getByRole('dialog', {
                name: 'Add New User'
            });

        this.addNewUserHeading =
            this.addUserDialog.getByRole(
                'heading',
                {
                    name: 'Add New User'
                }
            );

        this.workEmailInput =
            this.addUserDialog.getByRole(
                'textbox',
                {
                    name: 'Work Email'
                }
            );

        this.addUserButton =
            this.addUserDialog.getByRole(
                'button',
                {
                    name: /^Add User$/i
                }
            );

        this.resetButton =
            this.addUserDialog.getByRole(
                'button',
                {
                    name: /^Reset$/i
                }
            );

        this.orgAdminLabel =
            this.addUserDialog.getByText(
                'Invite as Org Admin',
                {
                    exact: true
                }
            );

        this.orgAdminToggle =
            this.orgAdminLabel.locator(
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
            page.getByText(
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
            page.getByText(
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

    escapeRegExp(value) {
        return value.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );
    }

    async navigateToManageUsers() {
        const profileButton =
            this.page.getByRole(
                'button',
                {
                    name: /Org Owner|PM Admin|Org Admin/i
                }
            ).first();

        await profileButton.click();

        const manageUsersMenu =
            this.page.getByText(
                'Manage Users',
                {
                    exact: true
                }
            );

        await manageUsersMenu.click();
    }

    async openInviteUser() {
        await this.inviteUsersButton.click();
    }

    async enterEmail(email) {
        if (!email) {
            throw new Error(
                'Invite email was not generated.'
            );
        }

        await this.workEmailInput.fill(email);
    }

    async enableOrgAdmin() {
        await this.orgAdminToggle.click();
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
            this.page.getByRole(
                'button',
                {
                    name: new RegExp(
                        `^${this.escapeRegExp(accessLevel)}\\b`,
                        'i'
                    )
                }
            ).last();

        await option.click();
    }

    async selectHRMSAccess(accessLevel) {
        await this.selectAccess(
            this.hrmsAccessDropdown,
            accessLevel
        );
    }

    async selectProjectManagementAccess(accessLevel) {
        await this.selectAccess(
            this.projectManagementAccessDropdown,
            accessLevel
        );
    }

    async selectCRMAccess(accessLevel) {
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
            this.page.getByText(
                projectName,
                {
                    exact: true
                }
            ).last();

        await project.click();
    }

    async submitUser() {
        await this.addUserButton.click();
    }

    async resetUserForm() {
        await this.resetButton.click();
    }

    async inviteUser({
        email,
        orgAdmin = false,
        projectManagementAccess = null,
        hrmsAccess = null,
        crmAccess = null,
        project = null
    }) {
        if (!email) {
            throw new Error(
                'Invite email is required.'
            );
        }

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
                await this.assignProject(project);
            }
        }

        await this.submitUser();

        return email;
    }

    async submitDuplicateEmail({
        existingEmail,
        projectManagementAccess = 'User'
    }) {
        if (!existingEmail) {
            throw new Error(
                'Existing email is required.'
            );
        }

        await this.openInviteUser();

        await this.enterEmail(existingEmail);

        await this.selectProjectManagementAccess(
            projectManagementAccess
        );

        await this.submitUser();
    }

    async retryWithNewEmail({
        email,
        projectManagementAccess = 'User'
    }) {
        if (!email) {
            throw new Error(
                'Retry email is required.'
            );
        }

        await this.resetUserForm();

        await this.enterEmail(email);

        await this.selectProjectManagementAccess(
            projectManagementAccess
        );

        await this.submitUser();

        return email;
    }
}