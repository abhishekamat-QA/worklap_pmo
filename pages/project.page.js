import { expect } from '@playwright/test';

export class ProjectPage {

    constructor(page) {
        this.page = page;
        this.pmoButton = page.getByRole('button', { name: 'PMO' });
        this.projectsHeading = page.getByRole('heading', { name: 'Projects', exact: true });
        this.newProjectLink = page.getByRole('link', { name: 'New Project' });
        this.projectNameInput = page.getByRole('textbox', { name: 'Enter project name' });
        this.createProjectButton = page.getByRole('button', { name: 'Create Project' });
        this.projectTypeDropdown = this.getFieldDropdown('Project Type');
        this.dateFields = page.locator('div').filter({ hasText: /^mm\/dd\/yyyy$/ });
        this.successMessage = page.getByText(/project created successfully|project has been created/i);

        // Suggested Project Owner and Suggested Team Members both render "Select"
        // buttons, so each is scoped to its own section to avoid cross-matching.
        // The section heading's parent is just a title wrapper div; the actual
        // list of members lives in a sibling div, so scope from the grandparent.
        this.projectOwnerSelectButtons = page
            .getByText('Suggested Project Owner', { exact: true })
            .locator('../..')
            .getByRole('button', { name: /^Select$/ });

        this.teamMemberSelectButtons = page
            .getByText('Suggested Team Members', { exact: true })
            .locator('../..')
            .getByRole('button', { name: /^Select$/ });
    }

    getFieldDropdown(labelText) {
        return this.page.getByText(labelText, { exact: true }).locator('..').getByRole('button').first();
    }

    // =========================================================
    // Navigation
    // =========================================================

    async navigateToProjects() {
        await expect(this.pmoButton).toBeVisible({ timeout: 15000 });
        await this.pmoButton.click();
        await this.page.waitForURL(/\/pmo\/projects/, { timeout: 30000 });
        await expect(this.projectsHeading).toBeVisible({ timeout: 15000 });
        console.log('Projects page loaded successfully');
    }

    async openNewProjectForm() {
        await expect(this.newProjectLink).toBeVisible({ timeout: 15000 });
        await this.newProjectLink.click();
        await expect(this.projectNameInput).toBeVisible({ timeout: 15000 });
        console.log('New Project form opened successfully');
    }

    // =========================================================
    // Form Fields
    // =========================================================

    async enterProjectName(projectName) {
        if (!projectName) {
            throw new Error('Project name is required.');
        }

        await expect(this.projectNameInput).toBeVisible({ timeout: 15000 });
        await this.projectNameInput.fill(projectName);
        console.log(`Project name entered: ${projectName}`);
    }

    async selectProjectOwner(index = 0) {
        // Suggested owners load asynchronously after the form renders; wait for
        // the first one instead of counting immediately (count() doesn't wait
        // and reads 0 under CI load, before the suggestions API call resolves).
        await expect(this.projectOwnerSelectButtons.first()).toBeVisible({ timeout: 15000 });

        const count = await this.projectOwnerSelectButtons.count();

        if (index >= count) {
            throw new Error(`Project owner index ${index} does not exist. Available: ${count}`);
        }

        await this.projectOwnerSelectButtons.nth(index).click();
        console.log(`Project owner selected: index ${index}`);
    }

    async selectProjectType(projectType) {
        if (!projectType) {
            throw new Error('Project type is required.');
        }

        await expect(this.projectTypeDropdown).toBeVisible({ timeout: 15000 });
        await this.projectTypeDropdown.click();

        const listbox = this.page.getByRole('listbox');
        await expect(listbox).toBeVisible({ timeout: 10000 });

        const option = listbox.getByRole('option', { name: projectType, exact: true });
        await expect(option).toBeVisible({ timeout: 10000 });
        await option.click();

        console.log(`Project type selected: ${projectType}`);
    }

    // =========================================================
    // Dates
    // =========================================================

    async getDateField(index = 0) {
        const fields = this.page.locator('div').filter({ hasText: /^mm\/dd\/yyyy$/ });
        const count = await fields.count();
        console.log(`Available date fields: ${count}`);

        if (count <= index) {
            throw new Error(`Date field index ${index} not found. Available date fields: ${count}`);
        }

        return fields.nth(index);
    }

    formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    async selectCalendarDate(date) {
        const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
        const calendarButton = this.page.getByRole('button', { name: new RegExp(`^${dayLabel}(,|$)`) });

        await expect(calendarButton).toBeVisible({ timeout: 10000 });
        await calendarButton.click();

        console.log(`Calendar date selected: ${this.formatDate(date)}`);
    }

    async selectStartDate(date = new Date()) {
        const startDateField = await this.getDateField(0);
        await expect(startDateField).toBeVisible({ timeout: 15000 });
        await startDateField.click();
        await this.selectCalendarDate(date);
        console.log(`Start date: ${this.formatDate(date)}`);
    }

    async selectEndDate(date) {
        const endDateField = await this.getDateField(0);
        await expect(endDateField).toBeVisible({ timeout: 15000 });
        await endDateField.click();
        await this.selectCalendarDate(date);
        console.log(`End date: ${this.formatDate(date)}`);
    }

    // Calculate End Date
    getEndDate(startDate, days = 30) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);
        return endDate;
    }

    // Select Start + End Date
    async selectProjectDates() {

        const startDate = new Date();                          
        const endDate = this.getEndDate(startDate, 30);

        console.log(`Start Date: ${this.formatDate(startDate)}`);
        console.log(`End Date: ${this.formatDate(endDate)}`);

        await this.selectStartDate(startDate);
        await this.page.waitForTimeout(500);
        await this.selectEndDate(endDate);
    }

    // =========================================================
    // Team Members
    // =========================================================

    async selectAllTeamMembers() {

        let selectButtonCount = await this.teamMemberSelectButtons.count();

        console.log(`Unselected team members: ${selectButtonCount}`);

        while (selectButtonCount > 0) {

            const selectButton = this.teamMemberSelectButtons.first();

            await selectButton.scrollIntoViewIfNeeded();

            await expect(selectButton).toBeVisible({ timeout: 10000 });

            await selectButton.click();

            // Re-count after each selection
            selectButtonCount = await this.teamMemberSelectButtons.count();
        }

        console.log('All team members are selected');
    }

    // =========================================================
    // Submit Project
    // =========================================================

    async submitProject() {
        await expect(this.createProjectButton).toBeEnabled({ timeout: 15000 });
        await this.createProjectButton.click();
        console.log('Create Project button clicked');
    }

    projectCard(projectName) {
        return this.page.getByText(projectName, { exact: true });
    }

    // =========================================================
    // Complete Project Creation
    // =========================================================

    async createProject({ projectName, projectType, ownerIndex = 0 }) {

        await this.openNewProjectForm();
        await this.enterProjectName(projectName);
        await this.selectProjectOwner(ownerIndex);
        await this.selectProjectType(projectType);

        // Existing date logic - DO NOT CHANGE
        await this.selectProjectDates();

        await this.selectAllTeamMembers();
        await this.submitProject();

        return projectName;
    }
}