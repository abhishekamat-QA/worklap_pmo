import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { getRuntimeUser } from './runtimeUserReader.js';

const authStatePath = 'test-data/authState.json';

const browser = await chromium.launch({
    headless: false
});

const context = await browser.newContext();
const page = await context.newPage();

try {
    const loginPage = new LoginPage(page);
    const user = getRuntimeUser();

    await page.goto('https://wlqa.testingmonkey.com');

    await loginPage.login(
        user.email,
        user.password
    );

    // Give the application a moment to finish storing auth data
    await page.waitForTimeout(2000);

    await context.storageState({
        path: authStatePath
    });

    console.log('Authentication state saved successfully.');
    console.log(`File: ${authStatePath}`);

} catch (error) {

    console.error('Failed to create authentication state:', error);
    process.exitCode = 1;

} finally {

    await browser.close();
}