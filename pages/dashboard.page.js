import { expect } from '@playwright/test';

export class DashboardPage {

    constructor(page) {
        this.page = page;

        this.projectManagementBtn =
            page.getByRole('button', { name: 'Project Management' });
    }

    async openProjectManagement() {
        await this.projectManagementBtn.click();
    }

    async verifyProjectPage() {
        await expect(this.page).toHaveURL(
            'https://wlqa.testingmonkey.com/automation-qa/pmo/projects'
        );
    }

}