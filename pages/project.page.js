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

        this.teamMemberSelectedButtons = page
            .getByText('Suggested Team Members', { exact: true })
            .locator('../..')
            .getByRole('button', { name: /^Selected$/ });

        // ==========================================
        // Merged from saipavan_QA: Edit Project
        // ==========================================

        this.projectDescriptionInput = page.locator('#projectDescription');
        this.editButton = page.getByRole('menuitem', { name: 'Edit Project' });
        this.updateButton = page.getByRole('button', { name: 'Update Project' });

        this.projectRow = (projectName) =>
            page.locator('tr').filter({ hasText: projectName });

        this.projectMenuButton = (projectName) =>
            this.projectRow(projectName).getByRole('button');

        // ==========================================
        // Merged from saipavan_QA: Project navigation via sidebar
        // ==========================================

        this.worklapLogo = page.getByRole('link', { name: 'worklap-logo' });
        this.projectsNavigation = page.locator('span[title="Projects"]');
        this.viewAllProjects = page.getByText('View all projects', { exact: true });

        // ==========================================
        // Merged from saipavan_QA: search-based Project Owner selection
        // (distinct from projectOwnerSelectButtons above, which picks from
        // the suggested-owners list by position on the create-project form)
        // ==========================================

        this.projectOwnerSection = page
            .locator('label')
            .filter({ hasText: 'Project Owner' })
            .locator('..');

        this.projectOwnerSearchInput = this.projectOwnerSection.getByPlaceholder('Search project owner...');

        this.projectOwnerSelectButtonBySearch = this.projectOwnerSection.getByRole('button', {
            name: 'Select',
            exact: true
        });
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

    // The date picker only renders the visible month's grid (plus a few
    // leading/trailing filler days to complete the grid rows), so a target
    // date outside that range must be reached by paging the calendar first.
    async navigateCalendarToMonth(date) {
        const targetMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
        const monthLabel = this.page.locator('.react-calendar__navigation__label__labelText');
        const nextButton = this.page.locator('.react-calendar__navigation__next-button');
        const prevButton = this.page.locator('.react-calendar__navigation__prev-button');

        await expect(monthLabel).toBeVisible({ timeout: 10000 });

        for (let i = 0; i < 24; i++) {
            const currentMonthYear = (await monthLabel.textContent()).trim();

            if (currentMonthYear === targetMonthYear) {
                return;
            }

            const [currentMonthName, currentYear] = currentMonthYear.split(' ');
            const currentIndex = Number(currentYear) * 12 + new Date(`${currentMonthName} 1, 2000`).getMonth();
            const targetIndex = date.getFullYear() * 12 + date.getMonth();

            await (targetIndex > currentIndex ? nextButton : prevButton).click();
        }

        throw new Error(`Could not navigate calendar to ${targetMonthYear}`);
    }

    async selectCalendarDate(date) {
        await this.navigateCalendarToMonth(date);

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

    async verifyAllTeamMembersSelected() {
        const remainingSelectButtons = await this.teamMemberSelectButtons.count();
        const selectedCount = await this.teamMemberSelectedButtons.count();

        expect(remainingSelectButtons).toBe(0);
        expect(selectedCount).toBeGreaterThan(0);

        console.log(`Verified ${selectedCount} team members are selected`);
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

    // =========================================================
    // Merged from saipavan_QA
    // =========================================================

    async openProjects() {

        await expect(this.worklapLogo).toBeVisible({ timeout: 15000 });
        await this.worklapLogo.click();

        await expect(this.page).toHaveURL(/\/pmo\//, { timeout: 15000 });

        if (!(await this.viewAllProjects.isVisible())) {
            await expect(this.projectsNavigation).toBeVisible({ timeout: 15000 });
            await this.projectsNavigation.click();
        }

        await expect(this.viewAllProjects).toBeVisible({ timeout: 15000 });
        await this.viewAllProjects.click();

        console.log('Opened View All Projects');
    }

    async getTopProjectName() {

        const topProjectRow = this.page.locator('table tbody tr').first();
        await expect(topProjectRow).toBeVisible({ timeout: 15000 });

        const projectName = (
            await topProjectRow.locator('td').first().locator('div.font-semibold.text-neutral').innerText()
        ).trim();

        if (!projectName) {
            throw new Error('Unable to get the top project name.');
        }

        console.log(`Top Project: ${projectName}`);
        return projectName;
    }

    generateProjectDescription() {
        const timestamp = Date.now();

        const description =
            `Updated project description for Playwright automation testing. ` +
            `This description is generated dynamically during test execution ` +
            `to validate the project update functionality successfully. ` +
            `Execution ID: ${timestamp}`;

        // Maximum allowed length = 200 characters
        return description.slice(0, 200);
    }

    // Picks a random Project Type option (used when editing a project) and
    // returns the selected label - distinct from selectProjectType(type)
    // above, which selects a caller-specified type on the create-project form.
    async selectRandomProjectType() {

        const projectTypeDropdown = this.getFieldDropdown('Project Type');
        await expect(projectTypeDropdown).toBeVisible({ timeout: 15000 });
        await projectTypeDropdown.click();

        const listbox = this.page.getByRole('listbox');
        await expect(listbox).toBeVisible({ timeout: 10000 });

        const options = listbox.getByRole('option');
        const optionCount = await options.count();

        if (optionCount === 0) {
            throw new Error('No Project Type options found.');
        }

        console.log(`Available Project Types: ${optionCount}`);

        const randomIndex = Math.floor(Math.random() * optionCount);
        const selectedOption = options.nth(randomIndex);
        const selectedProjectType = (await selectedOption.innerText()).trim();

        await selectedOption.click();
        console.log(`Project Type selected: ${selectedProjectType}`);

        return selectedProjectType;
    }

    // Search-based Project Owner selection (types a name/role into the
    // search box and selects the matching suggestion, skipping if already
    // selected). Distinct from selectProjectOwner(index) above, which picks
    // from the suggested-owners list by position on the create-project form.
    async selectProjectOwnerBySearch(searchText) {

        await expect(this.projectOwnerSearchInput).toBeVisible({ timeout: 15000 });
        await this.projectOwnerSearchInput.fill(searchText);
        console.log(`Project Owner searched: ${searchText}`);

        const selectButton = this.projectOwnerSelectButtonBySearch.first();
        const buttonCount = await selectButton.count();

        if (buttonCount === 0) {
            console.log(`${searchText} is already selected.`);
            return;
        }

        const buttonText = (await selectButton.innerText()).trim();

        if (buttonText === 'Select') {
            await expect(selectButton).toBeVisible({ timeout: 10000 });
            await selectButton.click();
            console.log(`Selected Project Owner: ${searchText}`);
        } else {
            console.log(`${searchText} is already selected.`);
        }
    }

    // Simple single-field project creation flow (name only, today's date,
    // all suggested team members) - distinct from createProject({...})
    // above, which drives the full form including type/owner/date range.
    async createBasicProject(name) {

        await this.projectNameInput.fill(name);
        await this.selectStartDate();
        await this.selectAllTeamMembers();
        await this.verifyAllTeamMembersSelected();

        await expect(this.createProjectButton).toBeEnabled({ timeout: 15000 });
        await this.createProjectButton.click();

        console.log(`Project created: ${name}`);
    }

    // =========================================================
    // Edit Project - PM Admin
    // =========================================================

    async editProject(currentProjectName) {

        const projectMenu = this.projectMenuButton(currentProjectName);
        await expect(projectMenu).toBeVisible({ timeout: 15000 });
        await projectMenu.click();

        await expect(this.editButton).toBeVisible({ timeout: 10000 });
        await this.editButton.click();

        const updatedProjectName = currentProjectName.slice(0, -2) + 'up';
        await this.projectNameInput.fill(updatedProjectName);

        const updatedDescription = this.generateProjectDescription();
        await this.projectDescriptionInput.fill(updatedDescription);

        const selectedProjectType = await this.selectRandomProjectType();

        await expect(this.updateButton).toBeEnabled({ timeout: 15000 });
        await this.updateButton.click();

        console.log(`Updated Project Name: ${updatedProjectName}`);
        console.log(`Updated Description Length: ${updatedDescription.length}`);
        console.log(`Updated Project Type: ${selectedProjectType}`);

        return {
            updatedProjectName,
            updatedDescription,
            projectType: selectedProjectType
        };
    }

    // =========================================================
    // Edit Project - PM Manager
    // =========================================================

    async editProjectAsManager(currentProjectName) {

        const projectMenu = this.projectMenuButton(currentProjectName);
        await expect(projectMenu).toBeVisible({ timeout: 15000 });
        await projectMenu.click();

        await expect(this.editButton).toBeVisible({ timeout: 10000 });
        await this.editButton.click();

        // Remove last 3 characters, add "mng"
        const updatedProjectName = currentProjectName.slice(0, -3) + 'mng';
        await this.projectNameInput.fill(updatedProjectName);
        console.log(`Updated Project Name: ${updatedProjectName}`);

        const updatedDescription = this.generateProjectDescription();
        await this.projectDescriptionInput.fill(updatedDescription);
        console.log(`Updated Description Length: ${updatedDescription.length}`);

        const selectedProjectType = await this.selectRandomProjectType();
        console.log(`Updated Project Type: ${selectedProjectType}`);

        await this.selectProjectOwnerBySearch('PM Manager');

        await expect(this.updateButton).toBeEnabled({ timeout: 15000 });
        await this.updateButton.click();

        console.log('Project updated successfully by PM Manager');

        return {
            updatedProjectName,
            updatedDescription,
            projectType: selectedProjectType
        };
    }
}
