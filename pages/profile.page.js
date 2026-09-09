import { expect } from '@playwright/test';

export class ProfilePage {

    constructor(page) {

        this.page = page;

        // Profile dropdown button
       this.profileDropdownButton = page.locator('//*[@id="root"]/div[1]/div[1]/header/div/div[2]/div[2]/button');

        // Profile option in dropdown
        // this.profileOption = page.locator("//span[normalize-space()='Profile']");

       this.profileOption = page.getByRole('button', { name: 'Profile', exact: true });
        // Organization Role
       this.organizationRole = page.getByText('Organization Role', { exact: true }).locator('..').locator('div.min-h-\\[46px\\] p');
                        }

    async openProfileDropdown() {

        await this.profileDropdownButton.click();

    }

    async openProfile() {

        await this.profileOption.click();

    }

    async verifyProfilePage() {

        await expect(this.page).toHaveURL(/\/settings\/user\/profile$/);

    }

   async verifyOrganizationRole(expectedRole) {

    await expect(this.organizationRole).toContainText(expectedRole);

}

}