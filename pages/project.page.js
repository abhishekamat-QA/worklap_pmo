import { expect } from '@playwright/test';

export class ProjectPage {

    constructor(page) {

        this.page = page;

        // ==========================================
        // CREATE PROJECT
        // ==========================================

        this.createProjectButton = page.getByRole('link', {
            name: 'New Project'
        });

        this.projectNameInput = page.getByRole('textbox', {
            name: 'Enter project name'
        });

        this.projectDescriptionInput = page.locator(
            '#projectDescription'
        );

        this.createButton = page.getByRole('button', {
            name: 'Create Project'
        });


        // ==========================================
        // PROJECT NAVIGATION
        // ==========================================

        this.worklapLogo = page.getByRole('link', {
            name: 'worklap-logo'
        });

        this.projectsNavigation = page.locator(
            'span[title="Projects"]'
        );

        this.viewAllProjects = page.getByText(
            'View all projects',
            {
                exact: true
            }
        );


        // ==========================================
        // DATE FIELDS
        // ==========================================

        this.dateFields = page
            .locator('div')
            .filter({
                hasText: /^mm\/dd\/yyyy$/
            });


        // ==========================================
        // TEAM MEMBERS
        // ==========================================

        this.teamMembersSection = page
            .getByText('Team Members', {
                exact: true
            })
            .locator('..');

        // Users who are not selected
        this.teamMemberSelectButtons =
            this.teamMembersSection.getByRole(
                'button',
                {
                    name: 'Select',
                    exact: true
                }
            );

        // Users who are already selected
        this.teamMemberSelectedButtons =
            this.teamMembersSection.getByRole(
                'button',
                {
                    name: 'Selected',
                    exact: true
                }
            );


        // ==========================================
        // EDIT PROJECT
        // ==========================================

        this.projectRow = (projectName) =>
            page.locator('tr').filter({
                hasText: projectName
            });

        this.projectMenuButton = (projectName) =>
            this.projectRow(projectName).getByRole(
                'button'
            );

        this.editButton = page.getByRole('menuitem', {
            name: 'Edit Project'
        });

        this.updateButton = page.getByRole('button', {
            name: 'Update Project'
        });
    }


    // ==========================================
    // GENERIC FIELD DROPDOWN
    // ==========================================

    getFieldDropdown(labelText) {

        return this.page
            .getByText(labelText, {
                exact: true
            })
            .locator('..')
            .getByRole('button')
            .first();
    }


    // ==========================================
    // OPEN CREATE PROJECT
    // ==========================================

    async openCreateProject() {

        await expect(
            this.createProjectButton
        ).toBeVisible({
            timeout: 15000
        });

        await this.createProjectButton.click();
    }


    // ==========================================
    // GET DATE FIELD
    // ==========================================

    async getDateField(index = 0) {

        const fields = this.page
            .locator('div')
            .filter({
                hasText: /^mm\/dd\/yyyy$/
            });

        const count = await fields.count();

        console.log(
            `Available date fields: ${count}`
        );

        if (count <= index) {
            throw new Error(
                `Date field index ${index} not found. ` +
                `Available date fields: ${count}`
            );
        }

        return fields.nth(index);
    }


    // ==========================================
    // FORMAT DATE
    // ==========================================

    formatDate(date) {

        const month = String(
            date.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            date.getDate()
        ).padStart(2, '0');

        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    }


    // ==========================================
    // SELECT CALENDAR DATE
    // ==========================================

    async selectCalendarDate(date) {

        const dayLabel =
            new Intl.DateTimeFormat(
                'en-US',
                {
                    month: 'long',
                    day: 'numeric'
                }
            ).format(date);

        const calendarButton =
            this.page.getByRole(
                'button',
                {
                    name: new RegExp(
                        `^${dayLabel}(,|$)`
                    )
                }
            );

        await expect(
            calendarButton
        ).toBeVisible({
            timeout: 10000
        });

        await calendarButton.click();

        console.log(
            `Calendar date selected: ${this.formatDate(date)}`
        );
    }


    // ==========================================
    // SELECT START DATE
    // ==========================================

    async selectStartDate(date = new Date()) {

        const startDateField =
            await this.getDateField(0);

        await expect(
            startDateField
        ).toBeVisible({
            timeout: 15000
        });

        await startDateField.click();

        await this.selectCalendarDate(date);

        console.log(
            `Start date selected: ${this.formatDate(date)}`
        );
    }


    // ==========================================
    // SELECT ALL TEAM MEMBERS
    // ==========================================

    async selectAllTeamMembers() {

        let selectButtonCount =
            await this.teamMemberSelectButtons.count();

        console.log(
            `Unselected team members: ${selectButtonCount}`
        );

        while (selectButtonCount > 0) {

            const selectButton =
                this.teamMemberSelectButtons.first();

            await selectButton.scrollIntoViewIfNeeded();

            await expect(
                selectButton
            ).toBeVisible({
                timeout: 10000
            });

            await selectButton.click();

            // Re-count after each selection
            selectButtonCount =
                await this.teamMemberSelectButtons.count();
        }

        console.log(
            'All team members are selected'
        );
    }


    // ==========================================
    // VERIFY ALL TEAM MEMBERS SELECTED
    // ==========================================

    async verifyAllTeamMembersSelected() {

        const remainingSelectButtons =
            await this.teamMemberSelectButtons.count();

        const selectedCount =
            await this.teamMemberSelectedButtons.count();

        expect(
            remainingSelectButtons
        ).toBe(0);

        expect(
            selectedCount
        ).toBeGreaterThan(0);

        console.log(
            `Verified ${selectedCount} team members are selected`
        );
    }


    // ==========================================
    // SELECT PROJECT TYPE DYNAMICALLY
    // ==========================================

    async selectProjectType() {

        const projectTypeDropdown =
            this.getFieldDropdown('Project Type');

        await expect(
            projectTypeDropdown
        ).toBeVisible({
            timeout: 15000
        });

        // Open dropdown
        await projectTypeDropdown.click();

        const listbox =
            this.page.getByRole('listbox');

        await expect(
            listbox
        ).toBeVisible({
            timeout: 10000
        });

        // Get available options
        const options =
            listbox.getByRole('option');

        const optionCount =
            await options.count();

        if (optionCount === 0) {
            throw new Error(
                'No Project Type options found.'
            );
        }

        console.log(
            `Available Project Types: ${optionCount}`
        );

        // Select a random available option
        const randomIndex =
            Math.floor(
                Math.random() * optionCount
            );

        const selectedOption =
            options.nth(randomIndex);

        const selectedProjectType =
            (
                await selectedOption.innerText()
            ).trim();

        await selectedOption.click();

        console.log(
            `Project Type selected: ${selectedProjectType}`
        );

        return selectedProjectType;
    }


    // ==========================================
    // GENERATE PROJECT DESCRIPTION
    // ==========================================

    generateProjectDescription() {

        const timestamp = Date.now();

        const description =
            `Updated project description for Playwright ` +
            `automation testing. This description is generated ` +
            `dynamically during test execution to validate the ` +
            `project update functionality successfully. ` +
            `Execution ID: ${timestamp}`;

        // Maximum allowed length = 200 characters
        return description.slice(0, 200);
    }


    // ==========================================
    // CREATE PROJECT
    // ==========================================

    async createProject(name) {

        // Enter project name
        await this.projectNameInput.fill(name);

        // Select today's date
        await this.selectStartDate();

        // Select all team members
        await this.selectAllTeamMembers();

        // Verify team members
        await this.verifyAllTeamMembersSelected();

        // Create project
        await expect(
            this.createButton
        ).toBeEnabled({
            timeout: 15000
        });

        await this.createButton.click();

        console.log(
            `Project created: ${name}`
        );
    }
//==========================================
// OPEN PROJECTS
//==========================================

    async openProjects() {

    // ==========================================
    // Step 1: Navigate back to PMO
    // ==========================================

    await expect(
        this.worklapLogo
    ).toBeVisible({
        timeout: 15000
    });

    await this.worklapLogo.click();


    // ==========================================
    // Step 2: Wait for PMO page
    // ==========================================

    await expect(
        this.page
    ).toHaveURL(
        /\/pmo\//,
        {
            timeout: 15000
        }
    );


    // ==========================================
    // Step 3: Expand Projects only if collapsed
    // ==========================================

    if (!(await this.viewAllProjects.isVisible())) {

        await expect(
            this.projectsNavigation
        ).toBeVisible({
            timeout: 15000
        });

        // Expand Projects section
        await this.projectsNavigation.click();
    }


    // ==========================================
    // Step 4: Wait for View All Projects
    // ==========================================

    await expect(
        this.viewAllProjects
    ).toBeVisible({
        timeout: 15000
    });


    // ==========================================
    // Step 5: Open All Projects
    // ==========================================

    await this.viewAllProjects.click();

    console.log(
        'Opened View All Projects'
    );
}


    // ==========================================
    // EDIT PROJECT
    // ==========================================

    async editProject(currentProjectName) {

        // Open menu for the project
        const projectMenu =
            this.projectMenuButton(
                currentProjectName
            );

        await expect(
            projectMenu
        ).toBeVisible({
            timeout: 15000
        });

        await projectMenu.click();


        // Open Edit Project
        await expect(
            this.editButton
        ).toBeVisible({
            timeout: 10000
        });

        await this.editButton.click();


        // ==========================================
        // UPDATE PROJECT NAME
        // ==========================================

        const updatedProjectName =
            currentProjectName.slice(0, -2) + 'up';

        await this.projectNameInput.fill(
            updatedProjectName
        );


        // ==========================================
        // UPDATE DESCRIPTION
        // ==========================================

        const updatedDescription =
            this.generateProjectDescription();

        await this.projectDescriptionInput.fill(
            updatedDescription
        );


        // ==========================================
        // UPDATE PROJECT TYPE
        // ==========================================

        const selectedProjectType =
            await this.selectProjectType();


        // ==========================================
        // UPDATE PROJECT
        // ==========================================

        await expect(
            this.updateButton
        ).toBeEnabled({
            timeout: 15000
        });

        await this.updateButton.click();


        // ==========================================
        // LOG RESULTS
        // ==========================================

        console.log(
            `Updated Project Name: ${updatedProjectName}`
        );

        console.log(
            `Updated Description Length: ${updatedDescription.length}`
        );

        console.log(
            `Updated Project Type: ${selectedProjectType}`
        );


        // Return updated values for test verification
        return {
            updatedProjectName,
            updatedDescription,
            projectType: selectedProjectType
        };
    }
}