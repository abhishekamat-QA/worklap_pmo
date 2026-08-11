import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { getRuntimeUser } from '../utils/runtimeUserReader';
//import { getFirstUser } from '../utils/jsonReader';

test.describe('Login Module', () => {

    test('Login with valid credentials', async ({ page }) => {

        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        
        const user = getRuntimeUser();
        await loginPage.goto();
        await loginPage.login(
            user.email,
            user.password
        );

        await dashboardPage.openProjectManagement();
        await dashboardPage.verifyProjectPage();
    });
});