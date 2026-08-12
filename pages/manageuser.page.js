
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


        this.addNewUserHeading = page.getByRole('heading', {
            name: 'Add New User'
        });

        this.workEmailInput = page.getByLabel('Work Email');

        this.addUserButton = page.getByRole('button', {
            name: /^Add User$/i
        });

        this.resetButton = page.getByRole('button', {
            name: /^Reset$/i
        });

        this.orgAdminToggle = page
            .locator('div:has-text("Invite as Org Admin") > button:not([aria-hidden="true"])')
            .first();


        this.hrmsAccessDropdown = page
            .getByText('HRMS Access', { exact: true })
            .locator('..')
            .locator('button');

        this.projectManagementAccessDropdown = page
            .getByText('Project Management Access', { exact: true })
            .locator('..')
            .locator('button');

        this.crmAccessDropdown = page
            .getByText('CRM Access', { exact: true })
            .locator('..')
            .locator('button');


        this.assignedProjectsDropdown = page.getByPlaceholder(
            'Search and assign projects'
        );


        this.moduleAccessError = page.getByText(
            'Please select at least one module access level.',
            { exact: true }
        );


        this.successMessage = page.getByText(
            /successfully|invitation sent|invited/i
        );

        this.emailAlreadyExistsMessage = page.getByText(
            /Email already exists|already exists/i
        );
    }


    async navigateToManageUsers() {

        const profileMenuTrigger = this.page
            .locator('button, [role="button"], [data-testid]')
            .filter({ hasText: /Ananya K|PM Admin|Org Owner/i })
            .first();

        await profileMenuTrigger.click();

        const manageUsersMenuItem = this.page.getByText(
            'Manage Users',
            { exact: true }
        );

        await manageUsersMenuItem.click();

        await this.manageUsersHeading.waitFor({
            state: 'visible'
        });
    }


    async openInviteUsers() {

        await this.inviteUsersButton.click();

        await this.addNewUserHeading.waitFor({
            state: 'visible'
        });
    }


    async enterWorkEmail(email) {

        await this.workEmailInput.fill(email);
    }

    async enableOrgAdminToggle() {

        await this.orgAdminToggle.click();

        await expect(this.page.getByText(
            'Invite as Org Admin',
            { exact: true }
        )).toBeVisible();
    }


    async selectAccessLevel(dropdown, accessLevel) {

        await dropdown.click();

        await this.page.getByRole('button', {
            name: new RegExp(`^${accessLevel}\\b`, 'i')
        }).click();
    }


    async selectHRMSAccess(accessLevel) {

        await this.selectAccessLevel(
            this.hrmsAccessDropdown,
            accessLevel
        );
    }


    async selectProjectManagementAccess(accessLevel) {

        await this.selectAccessLevel(
            this.projectManagementAccessDropdown,
            accessLevel
        );
    }


    async selectCRMAccess(accessLevel) {

        await this.selectAccessLevel(
            this.crmAccessDropdown,
            accessLevel
        );
    }


    async assignProject(projectName) {

        await this.assignedProjectsDropdown.click();

        await this.page.getByText(
            projectName,
            { exact: true }
        ).click();
    }


    async clickAddUser() {

        await this.addUserButton.click();
    }


    async resetForm() {

        await this.resetButton.click();
    }


    async expectEmailAlreadyExistsError() {

        await expect(this.emailAlreadyExistsMessage).toBeVisible();
    }


    async inviteUser({
        email,
        projectManagementAccess,
        project
    }) {

        await this.openInviteUsers();

        await this.enterWorkEmail(email);

        if (projectManagementAccess) {
            await this.selectProjectManagementAccess(
                projectManagementAccess
            );
        }


        if (project) {
            await this.assignProject(
                project
            );
        }

        await this.clickAddUser();
    }
}