import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import runtimeUser from '../test-data/runtimeUser.json' with { type: 'json' };

const browser = await chromium.launch();

const context = await browser.newContext();

const page = await context.newPage();

const loginPage = new LoginPage(page);

await loginPage.goto();

await loginPage.login(
    runtimeUser.email,
    runtimeUser.password
);

await context.storageState({
    path: 'test-data/authState.json'
});

await browser.close();

console.log(
    `Auth state generated for: ${runtimeUser.email}`
);